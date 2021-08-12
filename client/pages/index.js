import axios from 'axios';

const landing = ({ currentUser }) => {
    console.log(`currentUser`, currentUser);
    // axios.get('/api/users/currentuser'); //called from client
    return <h1>Landing Page</h1>
}


// landing.getInitialProps = async () => {
//     const response = await axios.get('/api/users/currentuser');
//     return response.data;
// } //called from server
// this gives error since in client side rendering the path we provide
// here /api/users/currentuser adds the ip of the machine it is running on
// in this case localhost
//but in server side rendering while taking default ip the http uses docker
//container's client ip
//there are two solutions - 1. we can configure axios with baseUrl
// for eg. in this case http://authsrv/api/users/currentuser
//but this means we are exposing the service name and routes
//so we can use 2. we can make our next app to send request to ingress and it will
// direct the request

//getInitialProps called when -
//1. when we hard refresh the page
//2. when clicking different domain
//3. typing URL into address box
//4. when we navigate to other route of app

landing.getInitialProps = async ({ req }) => {
    if (typeof window === 'undefined') {
        //we are on server
        //request will be made with ingress baseUrl
        const { data } = await axios.get(
            'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
            {
                headers: req.headers
            }
        );
        return data;
    } else {
        //we are on client
        //request will be made with empty string baseUrl
        const { data } = await axios.get('/api/users/currentuser');
        return data;
    }
}


export default landing;