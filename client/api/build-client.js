import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        //we are on server
        //request will be made with ingress baseUrl
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        })
    } else {
        //we are on client
        //request will be made with empty string baseUrl
        return axios.create({
            baseURL: '/'
        })

    }
}
export default buildClient;