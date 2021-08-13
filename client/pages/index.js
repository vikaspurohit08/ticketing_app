import buildClient from "../api/build-client";

const landing = ({ currentUser }) => {
    return currentUser ? <h1>You are signed in</h1> : <h1>You are not signed in</h1>
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

landing.getInitialProps = async (context) => {
    const client = buildClient(context);
    const { data } = await client.get('api/users/currentuser')
    return data;
}


export default landing;