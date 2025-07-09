import RegisterCard from "../components/RegisterCard"
import Container from "react-bootstrap/esm/Container"

function Register(){

    return(
        <div className="registerPortal flex-grow">
            <Container>
                <RegisterCard />

            </Container>

            
        </div>
        
    )
}

export default Register