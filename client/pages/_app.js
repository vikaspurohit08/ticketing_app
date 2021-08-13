import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const setCSS = ({ Component, pageProps, currentUser }) => {
    return <div>
        <Header currentUser={currentUser}></Header>
        <Component {...pageProps} /></div>
}

setCSS.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');
    let pageProps = {};
    if (appContext?.Component?.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx);
        //when we define getInitialProps of component then getInitialProps of
        //different pages does not invoke automatically.
        //hence we invoke the page getInitialProps by doing this
    }
    return {
        pageProps,
        ...data
    };
};

export default setCSS;

//used to import global css
// also can be used to add components on every page
