import requests


BASE_URL = "http://127.0.0.1:8000"

USERNAME = "candidate1"
PASSWORD = "Candidate@12345"

FILE_PATH = r"C:\Users\ADARSH\Downloads\AdarshP_Programmer_Resume.docx"


# 1. Login
login_response = requests.post(
    f"{BASE_URL}/api/auth/login/",
    json={
        "username": USERNAME,
        "password": PASSWORD,
    },
)

print("Login status:", login_response.status_code)

if login_response.status_code != 200:
    print("Login failed:")
    print(login_response.text)
    raise SystemExit


token = login_response.json()["access"]


# 2. Upload resume
headers = {
    "Authorization": f"Bearer {token}",
}

with open(FILE_PATH, "rb") as resume_file:

    files = {
        "file": (
            "AdarshP_Programmer_Resume.docx",
            resume_file,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }

    upload_response = requests.post(
        f"{BASE_URL}/api/candidates/resumes/",
        headers=headers,
        files=files,
    )


print("Upload status:", upload_response.status_code)
print("Response:")

try:
    print(upload_response.json())
except ValueError:
    print(upload_response.text)