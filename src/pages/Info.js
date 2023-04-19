import React from 'react'
import './Info.css';


function Info() {
  return (
    <>
      <div className="container">
        <div className="text-content">
          <h1>What's it all about?</h1>
          <span>
            Payload Checker is an open project that aims to facilitate the understanding
            of the structure of a payload.
          </span>

          <br /><br />

          <h1>Why would that be useful?</h1>
          <span>
            Understanding a payload is essential to enable the consumption of an API,
            there can be a lot of noise between the parties involved when there is no specific
            documentation or even when it is necessary to specify how to fill in each payload property.
          </span>

          <br /><br />

          <h1>Client side processing</h1>
          <span>
            All information is processed in your browser, no server involved, so your information never leaves here.
          </span>
        </div>
      </div>
    </>
  );
}

export default Info
