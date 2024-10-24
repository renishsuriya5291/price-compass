import SearchComponent from "../SearchComponent/SearchComponent";

const Home = () => {
    return (
        <div className="vh-80">
            <div className="row justify-content-center align-items-center h-100">
                <div className="text-center">
                    <h1 className="app-title mt-5">Find The Products...</h1>
                    <p className="app-description">Products Scraped From the Amazon.in</p>
                    <SearchComponent />
                </div>
            </div>
        </div>
    );
}

export default Home;