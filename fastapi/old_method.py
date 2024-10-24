from selenium import webdriver
from selenium.webdriver.common.by import By
import os
from bs4 import BeautifulSoup
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import shutil
import time

app = FastAPI()

def create_driver():
    """Create a new Selenium WebDriver instance."""
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run in headless mode if needed
    driver = webdriver.Chrome(options=options)
    return driver

def empty_directory(directory):
    """Remove and recreate a directory."""
    if os.path.exists(directory):
        shutil.rmtree(directory)  # Remove the entire directory and its contents
    os.makedirs(directory)  # Recreate the directory

# Create data directory if it doesn't exist
if not os.path.exists("data"):
    os.makedirs("data")

@app.get("/search")
async def get_item(q: str):
    item = q
    file_count = 0  # For naming saved files
    results = []  # List to hold dictionaries of product info

    # Record start time
    start_time = time.time()

    # Ensure the 'data' directory is emptied before each search
    empty_directory('data')

    try:
        # Create a new Selenium WebDriver instance
        driver = create_driver()

        # Iterate through pages 1 to 4 of search results
        for page in range(1, 5):
            driver.get(f"https://www.amazon.in/s?k={item}&page={page}&crid=15SZX1GJHAGCO&sprefix=iphon%2Caps%2C275&ref=nb_sb_noss_2")
            time.sleep(2)  # Add a delay to ensure page loads completely
            elems = driver.find_elements(By.CLASS_NAME, "puis-card-container")

            # Save HTML content of each card container
            for i, elem in enumerate(elems):
                d_html = elem.get_attribute("outerHTML")
                with open(f"data/{item}_{file_count}.html", "w", encoding="utf-8") as f:
                    f.write(d_html)
                file_count += 1

        # Parse the saved HTML files
        for file in os.listdir('data'):
            try:
                with open(f"data/{file}", 'r', encoding="utf-8") as f:
                    html_doc = f.read()

                soup = BeautifulSoup(html_doc, 'html.parser')

                # Extract title
                title_tag = soup.find("h2")
                title = title_tag.text.strip() if title_tag else "No Title"

                # Extract link
                link_tag = title_tag.find("a") if title_tag else None
                link = f"https://amazon.in{link_tag['href']}" if link_tag else "No Link"

                # Extract price
                price_tag = soup.find("span", class_="a-price-whole")
                price = price_tag.text.strip() if price_tag else "No Price"

                product_info = {
                    "title": title,
                    "price": price,
                    "link": link
                }
                results.append(product_info)

            except Exception as e:
                print(f"Error processing file {file}: {e}")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Ensure the browser is closed even if an error occurs
        if 'driver' in locals():
            driver.quit()

    # Calculate elapsed time
    elapsed_time = time.time() - start_time
    print(f"This result took {elapsed_time:.2f} seconds.")

    # Return JSON response
    return JSONResponse(content={"data": results})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
