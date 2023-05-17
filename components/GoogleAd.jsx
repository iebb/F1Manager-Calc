import React, {Component, useEffect, useState} from 'react';
const timeout = 200;
function GoogleAd({ classNames = "", slot, googleAdId, style, format = "autorelaxed" }) {

  const [googleInit, setGoogleInit] = useState(0);

  useEffect(() => {
    if (!googleInit) {
      setGoogleInit(setTimeout(() => {
        if (typeof window !== 'undefined')
          (window.adsbygoogle = window.adsbygoogle || []).push({});
      }, timeout));
    }

    return () => {
      clearTimeout(googleInit);
    }
  }, [googleInit])

  return (
    <div className={classNames}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block', width: 768, height: 90, textAlign: "center" }}
        data-ad-client={googleAdId}
        data-ad-slot={slot}
        data-ad-format={format || "auto"}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

export default GoogleAd;
