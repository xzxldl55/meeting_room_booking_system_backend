import { useEffect, useState } from 'react';

export function useCountDown(time: number) {
  const [disabledCaptchaBtn, setDisabledCaptchaBtn] = useState(false);
  const [captchaBtnCountDown, setCaptchaBtnCountDown] = useState(time);

  // 验证码倒计时
  useEffect(() => {
    if (!disabledCaptchaBtn) {
      return;
    }
    if (!captchaBtnCountDown) {
      setDisabledCaptchaBtn(false);
      setCaptchaBtnCountDown(time);
    } else {
      countDown(captchaBtnCountDown);
    }
  }, [captchaBtnCountDown, disabledCaptchaBtn]);

  function countDown(countDown: number) {
    const timer = setTimeout(() => {
      setCaptchaBtnCountDown(countDown - 1);
      clearInterval(timer);
    }, 1000);
  }

  function startCountDown() {
    setDisabledCaptchaBtn(true);
    countDown(time);
  }

  return {
    disabledCaptchaBtn,
    setDisabledCaptchaBtn,
    captchaBtnCountDown,
    setCaptchaBtnCountDown,
    countDown,
    startCountDown,
  };
}
