from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pdfplumber
import io
import re
from datetime import datetime

app = FastAPI(title="Cemrosta Parsing Service")

class DutyEvent(BaseModel):
    id: str
    type: str # 'FLIGHT', 'STANDBY', 'LAYOVER', 'OFF', 'LEAVE', 'TRAINING'
    date: str # YYYY-MM-DD
    flight_number: Optional[str] = None
    dep_port: Optional[str] = None
    arr_port: Optional[str] = None
    std: Optional[str] = None
    sta: Optional[str] = None
    sign_on: Optional[str] = None
    sign_off: Optional[str] = None
    description: Optional[str] = None

class RosterData(BaseModel):
    crew_name: Optional[str] = None
    month: str
    year: str
    airline: str
    events: List[DutyEvent]

@app.post("/parse-roster", response_model=RosterData)
async def parse_roster(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file format. PDF required.")

    content = await file.read()
    
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""
        
        return perform_extraction(full_text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")

def perform_extraction(text: str) -> RosterData:
    events = []
    
    # 1. Identify all Date Markers (e.g., 06-MAY-2026)
    date_regex = r'(\d{2})-([A-Z]{3})-(\d{4})'
    matches = list(re.finditer(date_regex, text, re.IGNORECASE))
    
    if not matches:
        return RosterData(month="Unknown", year="Unknown", airline="Unknown", events=[])

    months_map = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
        'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    }

    # Blacklist for IATA-lookalikes that are definitely NOT airports
    PORT_BLACKLIST = {'OFF', 'GDO', 'LVE', 'SIM', 'TRG', 'MH', 'DAY', 'UTC', 'LOC', 'RMK', 'RPT', 'HOU', 'MIN', 'SEC', 'HRS', 'DUR'}

    # Extract crew name
    name_match = re.search(r'Name:\s*([A-Z\s,]+)', text, re.IGNORECASE)
    crew_name = name_match.group(1).strip() if name_match else "Crew Member"
    # Clean name if it contains commas or extra spaces
    crew_name = re.sub(r'\s+', ' ', crew_name).replace(',', '')

    for i in range(len(matches)):
        match = matches[i]
        day, month_str, year = match.groups()
        month_str = month_str.upper()
        current_date = f"{year}-{months_map.get(month_str, '01')}-{day}"

        start_idx = match.end()
        end_idx = matches[i+1].start() if i+1 < len(matches) else len(text)
        chunk = text[start_idx:end_idx]

        # New approach: Line-based parsing within the day chunk
        lines = chunk.split('\n')
        day_events = []
        
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # 1. Flight Line Detection
            flight_match = re.search(r'MH\s*(\d+)', line, re.IGNORECASE)
            if flight_match:
                flight_no = flight_match.group(1)
                
                # Times on this specific line
                times = re.findall(r'\d{2}:\d{2}', line)
                
                # Ports on this specific line
                all_ports = re.findall(r'\b[A-Z]{3}\b', line)
                ports = [p for p in all_ports if p.upper() not in PORT_BLACKLIST]
                
                if len(ports) >= 2 and len(times) >= 2:
                    event = DutyEvent(
                        id=f"MH{flight_no}-{current_date}-{len(day_events)}",
                        type="FLIGHT",
                        date=current_date,
                        flight_number=f"MH {flight_no.zfill(3)}", # Standardized padding
                        dep_port=ports[0],
                        arr_port=ports[1],
                        std=times[0],
                        sta=times[1],
                    )
                    
                    # If there are 4 times, they are usually SignOn, STD, STA, SignOff
                    if len(times) >= 4:
                        event.sign_on = times[0]
                        event.std = times[1]
                        event.sta = times[2]
                        event.sign_off = times[3]
                    elif len(times) == 3:
                        # Heuristic: if first port is base (KUL), first time might be SignOn
                        if ports[0] == 'KUL':
                            event.sign_on = times[0]
                            event.std = times[1]
                            event.sta = times[2]
                        else:
                            event.std = times[0]
                            event.sta = times[1]
                            event.sign_off = times[2]
                    
                    day_events.append(event)
                continue

            # 2. Standby Detection
            standby_match = re.search(r'\b(S\d+-\d+)\b', line, re.IGNORECASE)
            if standby_match:
                code = standby_match.group(1)
                times = re.findall(r'\d{2}:\d{2}', line)
                day_events.append(DutyEvent(
                    id=f"{code}-{current_date}",
                    type="STANDBY",
                    date=current_date,
                    sign_on=times[0] if len(times) > 0 else "--:--",
                    sign_off=times[-1] if len(times) > 1 else "--:--",
                    description=f"Standby {code.upper()}"
                ))
                continue

            # 3. Ground Duties Detection (Only if no events yet for the day)
            ground_match = re.search(r'\b(OFF|GDO|LVE|LEAVE|AL|ANNUAL LEAVE|SIM|GRD|TRG|TRAINING|SEP|CRM|MED)\b', line, re.IGNORECASE)
            if ground_match and not day_events:
                d_desc = ground_match.group(1).upper()
                d_type = "GROUND"
                if d_desc in ('OFF', 'GDO'): d_type, d_desc = "OFF", "Day Off"
                elif d_desc in ('LVE', 'LEAVE', 'AL'): d_type, d_desc = "LEAVE", "Annual Leave"
                elif d_desc in ('SIM', 'GRD', 'TRG', 'TRAINING', 'SEP', 'CRM', 'MED'):
                    d_type, d_desc = "TRAINING", f"Training ({d_desc})"
                
                day_events.append(DutyEvent(
                    id=f"GND-{d_type}-{current_date}",
                    type=d_type,
                    date=current_date,
                    description=d_desc
                ))

        # Add collected day events to total list, sorted by time
        day_events.sort(key=lambda x: x.std or x.sign_on or "99:99")
        events.extend(day_events)

    return RosterData(
        crew_name=crew_name,
        month=matches[0].group(2),
        year=matches[0].group(3),
        airline="Malaysia Airlines",
        events=events
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
