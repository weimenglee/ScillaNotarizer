# ScillaNotarizer
A scilla smart contract to notarize song lyrics with its frond-end in React.

## Notarizer.scilla
The Scilla smart contract with two transitions - notarize() and checkDocument().

## Notarizer_withPayment.scilla
The Scilla smart contract with two transitions - notarize() and checkDocument().
For this contract, payment is needed when calling the checkDocument() transition. When the contract receives a payment, the fund is transferred to the owner of the contract. At the same time, if the user paid more than what is required, the contract will perform a refund. 

## main.css
The CSS file for the front-end dapp.

## App.js
The React frontend app for interacting with the Notarizer.scilla smart contract. 
It is also able to handle events fired by the smart contract.
