import ReviewComponent from "../ReviewComponent/ReviewComponent";


const Reviews = () => {
    return (
        <div className="vh-80">
            <div className="row justify-content-center align-items-center h-100">
                <div className="text-center">
                    <h1 className="app-title mt-5">Product Reviews</h1>
                    <p className="app-description">Get The Product Reviews easily from the Amazon Link.</p>
                    <ReviewComponent />
                </div>
            </div>
        </div>
    );
}

export default Reviews;