import React, { Component } from "react";

import {
    loadScriptsForEmbedMode
} from "../utils";

export default class EmbedBase extends Component {
    constructor(props) {
        super(props);
        loadScriptsForEmbedMode();
    }

    render () {
        return (
            <div></div>
        )
    }
}