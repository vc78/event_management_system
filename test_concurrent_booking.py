import requests
import concurrent.futures
import time

BASE_URL = "http://localhost:8080"

def run_test():
    # 1. Login as Admin
    print("Logging in as admin...")
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin2@ems.com",
        "password": "password"
    })
    
    if login_resp.status_code != 200:
        print("Failed to login as admin. Make sure admin2@ems.com / password exists.")
        print(login_resp.text)
        return
        
    token = login_resp.json().get("token")
    admin_id = login_resp.json().get("id")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create a test event with limited seats
    print("Creating test event with 5 seats...")
    event_payload = {
        "eventTitle": "Concurrent Test Event",
        "description": "Load testing race conditions",
        "eventDate": "2030-12-31",
        "startTime": "10:00:00",
        "ticketPrice": 100,
        "totalSeats": 5,
        "categoryId": 1,
        "venueId": 1,
        "organizerId": admin_id,
        "eventStatus": "PUBLISHED"
    }
    
    event_resp = requests.post(f"{BASE_URL}/api/events", json=event_payload, headers=headers)
    if event_resp.status_code not in (200, 201):
        print("Failed to create event. Make sure categoryId 1 and venueId 1 exist.")
        print(event_resp.text)
        return
        
    event_id = event_resp.json().get("id")
    print(f"Created event with ID: {event_id}")
    
    # 3. Create a test user or just use admin to book
    # (assuming admins can book tickets for themselves for testing)
    
    URL = f"{BASE_URL}/api/bookings"
    PAYLOAD = {
        "userId": admin_id,
        "eventId": event_id,
        "numberOfTickets": 1
    }
    
    def make_booking():
        try:
            response = requests.post(URL, json=PAYLOAD, headers=headers)
            return response.status_code, response.text
        except Exception as e:
            return 0, str(e)

    CONCURRENT_REQUESTS = 20
    success_count = 0
    conflict_count = 0
    other_errors = 0

    print(f"Firing {CONCURRENT_REQUESTS} concurrent booking requests for {event_payload['totalSeats']} seats...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
        futures = [executor.submit(make_booking) for _ in range(CONCURRENT_REQUESTS)]
        
        for future in concurrent.futures.as_completed(futures):
            status, text = future.result()
            if status in (200, 201):
                success_count += 1
            elif status == 409:
                conflict_count += 1
            else:
                other_errors += 1
                print(f"Other error: {status} - {text}")
    
    print("-" * 30)
    print(f"Total Requests Sent: {CONCURRENT_REQUESTS}")
    print(f"Success (Booked): {success_count} (Expected: {event_payload['totalSeats']})")
    print(f"Conflict (Not enough seats): {conflict_count} (Expected: {CONCURRENT_REQUESTS - event_payload['totalSeats']})")
    print(f"Other errors: {other_errors} (Expected: 0)")
    print("-" * 30)
    
    if success_count == event_payload['totalSeats'] and other_errors == 0:
        print("SUCCESS! Race condition avoided. Strict concurrency handled correctly.")
    else:
        print("FAILED! Race condition detected or other errors occurred.")

if __name__ == "__main__":
    run_test()
