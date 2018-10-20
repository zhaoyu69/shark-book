import React from 'react';
import {observer} from "mobx-react";
import Footer from "components/footer";
import styles from './index.less';

@observer
class Discover extends React.Component {
    render() {
        return (
            <div className={styles.container}>
                <header>Discover</header>
                <div className={styles.main}>

                </div>
                <Footer />
            </div>
        );
    }
}

export default Discover;
