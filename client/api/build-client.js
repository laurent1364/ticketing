import axios from "axios";

export default ({req}) => {
    // We are on the server
    // route => http://SERVICE_NAME.NETWORK_NAME.svc.cluster.local/ .....
    // NETWORK_NAME => kubectl get networks
    // SERVICE_NAME => kubectl get services -n NETWORK_NAME
    if (typeof window === 'undefined') {
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        })

        // several reason doing that:
        //   - get host from the header to set host correctly related to the ingress yaml file define on k8s
        //   - get the cookie so as to use it as authentication transport
    }
    // We are on the browser
    else {
        return axios.create({
            baseURL: '/'
        })
    }
}
