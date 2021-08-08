import React, {Component} from 'react';
import {oauth} from "../App"
import '../App.css';
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {Redirect} from "react-router-dom";
import {createJwt} from "../Helpers/jwt-helpers";

const axios = require("axios")


class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            success: false,
            avatar_url: "https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png",
            user: {id: null, avatar: null, username: null, discriminator: null},
            notBanned: false
        }

        this.updateState = this.updateState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }


    updateState(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        var url = process.env.REACT_APP_WEBHOOK_URL;
        const now = new Date();
        let unbanInfo = {
            userId: this.state.user.id,
            email: this.state.user.email
        };
        let unbanUrl = window.location.origin + "/.netlify/functions/unban";
        var embed = [{
            title: "Yeni Başvuru Alındı",
            type: "rich",
            author: {
                name: this.state.user.username,
                icon_url: this.state.avatar_url
            },
            description: `**Username**: <@${this.state.user.id}> (${this.state.user.username}#${this.state.user.discriminator})\n` +
                "**Adınız, Yaşınız ve Discord Adınız?**\n" + this.state.ban_reason + "\n\n" +
                "**Hangi Departmanda Çalışmak İstiyorsunuz, Daha Önce Hangi Sunucularda Çalıştınız?**\n" + this.state.unban_reason + "\n\n" +
                "**Sizi Neden Seçelim?**\n" + this.state.future_behavior + "\n\n ",
                // "**Actions**\n" +
                // `[Approve appeal and unban user](${unbanUrl}?token=${encodeURIComponent(createJwt(unbanInfo))})`,
            timestamp: now.toISOString()
        }];
        axios.post(url, {embeds: embed}).then(() => {
            this.setState({success: true})
        }).catch(alert)
        e.preventDefault();
    }

    componentDidMount() {
        oauth.getUser(localStorage.getItem("access_token"))
            .then((user) => {
                if (!process.env.REACT_APP_SKIP_BAN_CHECK) {
                    axios.get("/.netlify/functions/user-checks?user_id=" + user.id).then((response) => {
                        if (!response.data.is_banned) {
                            this.setState({notBanned: true})
                        }
                    })
                }
                this.setState({user: user})
                if (this.state.user.avatar) {
                    this.setState({avatar_url: "https://cdn.discordapp.com/avatars/" + this.state.user.id + "/" + this.state.user.avatar + ".png"})
                }
            });
    }

    render() {
        if (this.state.success) {
            return <Redirect to='/success'/>;
        }
        if (this.state.notBanned) {
            return <Redirect to={{
                pathname: '/404',
                state: {errorCode: '403', errorMessage: "It looks like you're not banned... yet..."}
            }}/>;
        }
        return (
            <Grid item xs={12} className={"form"}>
                <Grid
                    container
                    spacing={4}
                    direction="row"
                    justify="center"
                    alignItems="center">
                    <Grid item xs={12} className={"avatar"}>
                        <img alt={"Your discord profile"} src={this.state.avatar_url} height={100}/>
                        <h2>{this.state.user.username}#{this.state.user.discriminator}</h2>
                    </Grid>
                    <Grid item xs={12}>
                        <form onSubmit={this.handleSubmit} noValidate>
                            <div>
                                <InputLabel htmlFor="why-ban">Adınız, Yaşınız ve Discord Adınız?</InputLabel>
                                <TextField onChange={this.updateState} variant="outlined" className={"textarea"}
                                           id="why-ban" name="ban_reason" aria-describedby="my-helper-text" fullWidth
                                           multiline rows={4}/>
                                <InputLabel htmlFor="why-unban">Hangi Departmanda Çalışmak İstiyorsunuz, Daha Önce Hangi Sunucularda Çalıştınız?</InputLabel>
                                <TextField onChange={this.updateState} variant="outlined" className={"textarea"}
                                           id="why-unban" name="unban_reason" aria-describedby="my-helper-text"
                                           fullWidth
                                           multiline rows={4}/>
                                <InputLabel htmlFor="avoid-ban">Sizi Neden Seçelim?</InputLabel>
                                <TextField onChange={this.updateState} variant="outlined" className={"textarea"}
                                           id="avoid-ban" aria-describedby="my-helper-text" name="future_behavior"
                                           fullWidth
                                           multiline rows={4}/>
                                <Button variant="contained" type={"submit"}>Submit</Button>
                            </div>
                        </form>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

export default Form;
