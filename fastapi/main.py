from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import concurrent.futures
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(options=options)
    return driver

def fetch_page(item, page):
    driver = create_driver()
    try:
        driver.get(f"https://www.amazon.in/s?k={item}&page={page}")
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "puis-card-container"))
        )
        elems = driver.find_elements(By.CLASS_NAME, "puis-card-container")
        return [elem.get_attribute("outerHTML") for elem in elems]
    finally:
        driver.quit()

@app.get("/search")
async def get_item(q: str):
    item = q
    results = []
    start_time = time.time()

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(fetch_page, item, page) for page in range(1, 5)]
        
        for future in concurrent.futures.as_completed(futures):
            try:
                page_elems = future.result()
                for d_html in page_elems:
                    soup = BeautifulSoup(d_html, 'html.parser')

                    title_tag = soup.find("h2")
                    title = title_tag.text.strip() if title_tag else "No Title"

                    link_tag = title_tag.find("a") if title_tag else None
                    link = f"https://amazon.in{link_tag['href']}" if link_tag else "No Link"

                    price_tag = soup.find("span", class_="a-price-whole")
                    price = price_tag.text.strip() if price_tag else "No Price"
                    image_tag = soup.find("img", class_="s-image")
                    image = image_tag['src'] if image_tag else "No Image"

                    product_info = {
                        "title": title,
                        "price": price,
                        "link": link,
                        "img": image
                    }
                    results.append(product_info)
            except Exception as e:
                print(f"Error processing page: {e}")

    elapsed_time = time.time() - start_time
    print(f"This result took {elapsed_time:.2f} seconds.")

    return JSONResponse(content={"data": results})

def fetch_reviews(url):
    driver = create_driver()
    reviews = []

    try:
        driver.get(url)

        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "review-views"))
        )

        # Fetch reviews from the list of review cards
        review_cards = driver.find_elements(By.CLASS_NAME, "a-section.review.aok-relative")

        for card in review_cards:
            soup = BeautifulSoup(card.get_attribute("outerHTML"), 'html.parser')

            # Fetch reviewer name
            reviewer_name_tag = soup.select_one('.a-profile-name')
            reviewer_name = reviewer_name_tag.get_text(strip=True) if reviewer_name_tag else "No Name"

            # Fetch rating
            rating_tag = soup.select_one('.a-icon-alt')
            rating = float(rating_tag.get_text(strip=True).split()[0]) if rating_tag else 0.0

            # Fetch review text
            review_text_tag = soup.select_one('.review-text-content span')
            review_text = review_text_tag.get_text(strip=True) if review_text_tag else "No Review"

            # Fetch profile link
            profile_link_tag = soup.select_one('.a-profile')
            profile_link = f"https://www.amazon.in/{profile_link_tag.get('href')}" if profile_link_tag else "No Profile Link"

            # Append the review data
            reviews.append({
                "reviewer_name": reviewer_name,
                "rating": rating,
                "review_text": review_text,
                "profile_link": profile_link
            })

    finally:
        driver.quit()

    return reviews

@app.get("/reviews")
async def get_reviews(q: str):
    start_time = time.time()
    reviews = fetch_reviews(q)

    elapsed_time = time.time() - start_time
    print(f"This result took {elapsed_time:.2f} seconds.")

    return JSONResponse(content={"reviews": reviews})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
