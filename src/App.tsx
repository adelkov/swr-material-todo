import React from 'react';
import Drawer from "./components/Drawer"
import useSWR, {SWRConfig} from 'swr'


function App() {
    const API = "https://jsonplaceholder.typicode.com";

    return (
        <SWRConfig
            value={{
                fetcher: (path: string) => {
                    // could attach token or other headers
                    console.log("fetching: " + path);
                    return fetch(API + path).then(res => res.json());
                }
            }}
        >
            <Drawer/>
        </SWRConfig>
    );
}

export default App;
