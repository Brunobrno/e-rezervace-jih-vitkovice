import { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

import Step1SelectSquare from './Step1SelectSquare';
import Step2SelectEvent from './Step2SelectEvent';
import Step3Map from './Step3Map';
import Step4Summary from './Step4Summary';

import eventAPI from '../../api/model/event'
import squareAPI from '../../api/model/square'
import market_slotAPI from '../../api/model/market_slot'
import orderAPI from '../../api/model/order'
import reservationAPI from '../../api/model/reservation'


const ReservationWizard = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    square: squareAPI.get(),
    event: ,
    slots: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <>
      <ProgressBar now={(step / 4) * 100} className="mb-4" />

      {step === 1 && (
        <Step1SelectSquare data={data} setData={setData} next={next} />
      )}
      {step === 2 && (
        <Step2SelectEvent data={data} setData={setData} next={next} prev={prev} />
      )}
      {step === 3 && (
        <Step3Map data={data} setData={setData} next={next} prev={prev} />
      )}
      {step === 4 && (
        <Step4Summary data={data} prev={prev} />
      )}
    </>
  );
};

export default ReservationWizard;
