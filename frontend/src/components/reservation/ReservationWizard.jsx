import { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

import Step1SelectSquare from './Step1SelectSquare';
import Step2SelectEvent from './Step2SelectEvent';
import Step3Map from './Step3Map';
import Step4Summary from './Step4Summary';

import orderAPI from '../../api/model/order';

const ReservationWizard = () => {
  const [data, setData] = useState({
    square: null,
    event: null,
    slots: [],
  });
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const response = await orderAPI.createOrder({
        event: data.event.id,
        slots: data.slots.map((s) => s.id),
      });
      alert('Objednávka byla úspěšně odeslána!');
      console.log('📦 Objednáno:', response);
    } catch (error) {
      console.error('❌ Chyba při odesílání objednávky:', error);
      alert('Něco se pokazilo při odesílání objednávky.');
    }
  };

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
        <Step4Summary
          formData={{
            selectedSquare: data.square,
            selectedEvent: data.event,
            selectedSlot: data.slots,
          }}
          onBack={prev}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default ReservationWizard;
