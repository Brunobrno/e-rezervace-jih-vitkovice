import Button from "react-bootstrap/Button";
import React from "react";


function Test(){

    return(
        <div>
            <Button variant="danger" href="/clerk/create/reservation" >Clerk</Button>
            <Button variant="success" href="/seller/reservation" >Seller</Button>
        </div>
    )
}

export default Test;