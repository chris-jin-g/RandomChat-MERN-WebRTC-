import 'whatwg-fetch';
const RESTAPIUrl = "http://localhost:8080";

export default dataService = {
    signUpService = (signUpCreds) => {
        fetch("/api/account/signup", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signUpCreds),
        })
        .then(res => res.json())
        .then(json => {
            console.log('json', json);
            console.log(res);
            return json;
            
        })
    }
};