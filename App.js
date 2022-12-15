import logo from './logo.svg';
import './App.css';

import './main.css';
import React from "react";

const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { BN, Long, units } = require('@zilliqa-js/util');

const {
  StatusType,
  MessageType,
} = require('@zilliqa-js/subscriptions');

//---address of the smart contract---
const contractAddress = "0x1d5be81303aaab48ffc2814cd6064a4c2eb7235f";

class App extends React.Component {

  //---------------
  //* constructor *
  //---------------
  constructor(props){
    super(props);

    // init the state variables
    this.state = {  
      status : "[Status]", 
      document : "" 
    };
  }

  //-------------------------------------
  //* Get the current account in ZilPay *
  //-------------------------------------
  getCurrentAccount = () => {
    window.zilPay.wallet.connect()
    .then(
      function(connected){
        console.log(connected)
        console.log(window.zilPay.wallet.net);
        console.log(window.zilPay.wallet.defaultAccount);

        // subscribe to network changes
        window.zilPay.wallet.observableNetwork().subscribe(
          function (network) {
              console.log("Network has been changed to " + network);
          });

        // subscribe to user account changes
        window.zilPay.wallet.observableAccount().subscribe(
          function (account) {
              console.log("Account has been changed to " + 
                  account.base16 + " (" + account.bech32 + ")");
              window.zilPay.blockchain.getBalance(account.bech32)
              .then(function(resp){
                  console.log(resp);
              })                    
          })
      }
    )
  }

  //-----------------------------------------------
  //* Check if ZilPay is installed on the browser *
  //-----------------------------------------------
  connectZilPay = () => {
    if (window.zilPay){
      console.log("ZilPay Present")      
      this.getCurrentAccount()
    } else{
        console.log("Cannot Find ZilPay")
    }
  }

  //------------------------
  //* Get Contract Details *
  //------------------------
  getContractDetails = () => {
    const notarizerContract = 
      window.zilPay.contracts.at(contractAddress);

    // get the init data of the contract
    notarizerContract.getInit().then(function(initData){
        console.log(initData);
    })    // get the code of the contract
    notarizerContract.getCode().then(function(code){
        console.log(code); 
    })    // get the state of the contract
    notarizerContract.getState().then(function(stateData){
        console.log(stateData);
    })
  };

  //------------------------------------------
  //* Listen to events fired by the contract *
  //------------------------------------------
  subscribeToEvents = () => {
    // use https://api.zilliqa.com for Mainnet
    const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');

    const subscriber = 
      // use wss://api-ws.zilliqa.com for Mainnet
      zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
      'wss://dev-ws.zilliqa.com', 
      {        
        addresses: [contractAddress],
      }
    );

    // subscribed successfully
    subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG, 
    (event) => {      
      console.log('Subscribed: ', event);
    });

    // fired when an event is received
    subscriber.emitter.on(MessageType.EVENT_LOG, 
    (event) => {    
      console.log('get new event log: ', JSON.stringify(event));

      if ("value" in event) {
        console.log(
          event["value"][0]["event_logs"][0]["params"][0]["value"]);
        console.log(
          event["value"][0]["event_logs"][0]["params"][1]["value"]);         
        this.setState(
        { status: 
         event["value"][0]["event_logs"][0]["params"][1]["value"]});

        subscriber.stop();
      }
    });

    // unsubscribed successfully
    subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {    
      console.log('Unsubscribed: ', event);
    });

    subscriber.start();
  }

  //-----------------------
  //* Notarize the string *
  //-----------------------
  notarize = () => {
    this.subscribeToEvents();
    this.setState({status:"Please wait..."})
    const notarizerContract = 
      window.zilPay.contracts.at(contractAddress);
      try {        
        notarizerContract.call(
            'notarize',
            [
                {
                    vname: 'document',
                    type: 'String',
                    value: this.state.document
                },
            ],
            {
                version: 21823489,   // For mainnet, use 65537
                                     // For testnet, use 21823489
                amount: new BN(0),
                gasPrice: units.toQa('2000', units.Units.Li),
                gasLimit: Long.fromNumber(8000)
            }    
        );
    } catch (err) {
        console.log(err);
    }
  }

  //------------------------------------------------
  //* Check if the string was previously notarized *
  //------------------------------------------------
  checkDocument = () => {
    this.subscribeToEvents();
    this.setState({status:"Please wait..."})
    const notarizerContract =     
      window.zilPay.contracts.at(contractAddress);
      try {
        notarizerContract.call(
            'checkDocument',
            [
                {
                    vname: 'document',
                    type: 'String',
                    value: this.state.document
                },
            ],
            {
                version: 21823489,   // For mainnet, it is 65537
                                     // For testnet, it is 21823489
                amount: new BN(0),
                gasPrice: units.toQa('2000', units.Units.Li),
                gasLimit: Long.fromNumber(8000)
            }    
        );
    } catch (err) {
        console.log(err);
    }
  }

  // fired when the text in the textbox changes
  documentChange = (val) => {
    this.setState({document:val.target.value});
  }

  render() {
    return (
      <div class="container">
        <h1>Document Notarizer</h1>
        <center>          
          <button id="btnConnectZilPay" 
            onClick={this.connectZilPay} >            
            Connect ZilPay</button> 
          <button id="btnGetContractDetails"
            onClick={this.getContractDetails} >
            Get Contract Details
          </button>
        </center>

        <label for="document" >Enter a string below</label>

        <input type="text" onChange={this.documentChange} />

        <div style={{ display: "flex", flexFlow: "row"}} >
          <button id="btnNotarize" onClick={this.notarize}>Notarize</button>
          <button id="btnCheck" onClick={this.checkDocument}>Check</button>       
        </div>

        <center><h3 id="result">{this.state.status}</h3></center>         
      </div>
    );
  }
}

export default App;
