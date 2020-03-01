const {Wallet, Utils, XpringClient} = require("xpring-js");
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

// Constants
const networks = {
    mainet: {
        remoteURL: "alpha.test.xrp.xpring.io:50051"
    },
    testnet: {
        remoteURL: "alpha.xrp.xpring.io:500"
    }
};

const XPRING_TEST_NETWORK_URL = "https://hermes-rest.ilpv4.dev";

// Prefilled accounts ID on ILP testnet
const accountIdXRP = "user_Hbre7ySf";
const accountIdUSD = "user_yMVY5ZoT";

// Auth Token
const authTokenXRP = "65YvH7NfbyyLc";
const authTokenUSD = "vGbEefyPU64Ff";

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.post("/api/send", async (req, res) => {
    let {accountId, amount, destinationPaymentPointer} = req.body;

    let response = null;
    try {
        response = await axios({
            method: "post",
            url: `${XPRING_TEST_NETWORK_URL}/accounts/${accountId}/pay`,
            data: {
                amount: amount,
                destinationPaymentPointer: destinationPaymentPointer
            },
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + authTokenXRP,
                Accept: "application/json"
            }
        });
    } catch (err) {
        console.error(err);
    }

    res.status(202).send({response: response.data});
});

app.get("/api/get/:accountId", async (req, res) => {
    let {accountId} = req.params;

    let response = null;
    try {
        response = await axios({
            method: "get",
            url: `${XPRING_TEST_NETWORK_URL}/accounts/${accountId}/balance`,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + authTokenXRP
            }
        });
    } catch (err) {
        console.error(err);
    }

    res.status(202).json({response: response.data});
});

app.listen(3000, () => {
    console.log("Your port listen on 3000");
});
