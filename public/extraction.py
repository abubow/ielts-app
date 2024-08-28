from bs4 import BeautifulSoup
import json

# Open the HTML file and parse it with BeautifulSoup
with open("questions.html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "lxml")

# Find all relevant headings and lists
elements = soup.find_all(["p", "ul"])

questions_dict = {}
current_topic = None

# Function to check if a text is a valid topic title
def is_valid_topic(text):
    return len(text.split()) <= 3 and text.isalpha()

# Iterate through the elements to extract topics and questions
for element in elements:
    if element.name == "p":
        # Only treat the text as a topic if it is short and likely a title
        text = element.get_text(strip=True)
        if is_valid_topic(text):
            current_topic = text
            questions_dict[current_topic] = []
        else:
            # If it's not a valid topic, assume it's continuation text or sub-question
            if current_topic:
                questions_dict[current_topic].append(text)
    elif element.name == "ul" and current_topic:
        # Append questions to the current topic's list
        questions = [li.get_text(strip=True) for li in element.find_all("li")]
        questions_dict[current_topic].extend(questions)

# Convert the dictionary to a JSON object
questions_json = json.dumps(questions_dict, indent=4)

# Output the JSON object
print(questions_json)

# Optionally, write the JSON object to a file
with open("questions.json", "w", encoding="utf-8") as json_file:
    json_file.write(questions_json)
