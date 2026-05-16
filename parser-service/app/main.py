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

    # Extract crew name
    name_match = re.search(r'Name:\s*([A-Z\s]+)', text, re.IGNORECASE)
    crew_name = name_match.group(1).strip() if name_match else "Crew Member"

    for i in range(len(matches)):
        match = matches[i]
        day, month_str, year = match.groups()
        month_str = month_str.upper()
        current_date = f"{year}-{months_map.get(month_str, '01')}-{day}"

        start_idx = match.end()
        end_idx = matches[i+1].start() if i+1 < len(matches) else len(text)
        chunk = text[start_idx:end_idx]

        # Flights
        flight_matches = list(re.finditer(r'MH\s*(\d+)', chunk, re.IGNORECASE))
        for f_idx, f_match in enumerate(flight_matches):
            flight_no = f_match.group(1)
            flight_chunk = chunk[f_match.start():]
            
            times = re.findall(r'\d{2}:\d{2}', flight_chunk)
            ports = re.findall(r'\b[A-Z]{3}\b', flight_chunk)

            event = DutyEvent(
                id=f"MH{flight_no}-{current_date}-{f_idx}",
                type="FLIGHT",
                date=current_date,
                flight_number=f"MH{flight_no}",
                dep_port=ports[0] if len(ports) > 0 else "???",
                arr_port=ports[1] if len(ports) > 1 else "???",
                std=times[0] if len(times) > 0 else "00:00",
                sta=times[1] if len(times) > 1 else "00:00",
            )
            
            # Refine times if more are present (SignOn/SignOff)
            if f_idx == 0 and len(times) >= 4:
                event.sign_on = times[0]
                event.std = times[1]
                event.sta = times[2]
                event.sign_off = times[3]
            elif len(times) >= 3:
                event.std = times[0]
                event.sta = times[1]
                event.sign_off = times[2]

            events.append(event)

        # Standbys
        standby_matches = list(re.finditer(r'(S\d+-\d+)', chunk, re.IGNORECASE))
        for s_match in standby_matches:
            code = s_match.group(1)
            s_chunk = chunk[s_match.start():]
            times = re.findall(r'\d{2}:\d{2}', s_chunk)
            
            events.append(DutyEvent(
                id=f"{code}-{current_date}",
                type="STANDBY",
                date=current_date,
                sign_on=times[0] if times else "--:--",
                sign_off=times[-1] if times else "--:--",
                description=f"Standby {code.upper()}"
            ))

        # OFF, LEAVE, TRAINING
        if not flight_matches and not standby_matches:
            if re.search(r'\bOFF\b|\bGDO\b', chunk, re.IGNORECASE):
                events.append(DutyEvent(id=f"OFF-{current_date}", type="OFF", date=current_date, description="Day Off"))
            elif re.search(r'\bLVE\b|\bLEAVE\b|\bAL\b', chunk, re.IGNORECASE):
                events.append(DutyEvent(id=f"LVE-{current_date}", type="LEAVE", date=current_date, description="Annual Leave"))
            elif re.search(r'\bSIM\b|\bGRD\b|\bTRG\b|\bTRAINING\b', chunk, re.IGNORECASE):
                events.append(DutyEvent(id=f"TRG-{current_date}", type="TRAINING", date=current_date, description="Training"))

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
