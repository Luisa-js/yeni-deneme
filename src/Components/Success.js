import React, {Component} from 'react';
import Grid from "@material-ui/core/Grid";

class Success extends Component {
    render() {
        return (
            <Grid item>
                <h1 style={{textAlign: "center", color: "#00e676"}}>Başvurunuz alındı, beklemede kalın.</h1>
            </Grid>
        );
    }
}

export default Success;