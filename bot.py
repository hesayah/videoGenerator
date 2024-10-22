import requests

url = "http://localhost:3000/api/quiz"
payload = {"quizType": "multiple"}
headers = {"Content-Type": "application/json"}

for i in range(15):
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        print(f"Appel {i+1} réussi: {response.json()}")
    else:
        print(f"Appel {i+1} échoué: {response.status_code} - {response.text}")