import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [pricePerHour, setPricePerHour] = useState(0);
  const [pricePerYear, setPricePerYear] = useState(0);
  const [pricePerYearInRON, setPricePerYearInRON] = useState(0);
  const [hoursPerDay, setHoursPerDay] = useState(0);
  const [hoursPerYear, setHoursPerYear] = useState(0);
  const [minimumGrossWage, setMinimumGrossWage] = useState(3000);
  const [netIncome, setNetIncome] = useState(0);
  const [netIncomeHour, setNetIncomeHour] = useState(0);
  const [totalTaxes, setTotalTaxes] = useState(0);
  const [casFlag, setCasFlag] = useState(false);
  const [cassFlag, setCassFlag] = useState(false);
  const [cassLowLimitFlag, setCassLowLimitFlag] = useState(false);
  const [middleLimitFlag, setMiddleLimitFlag] = useState(false);
  const [casValue, setCasValue] = useState(0);
  const [cassValue, setCassValue] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [errorFlag, setErrorFlag] = useState(false);
  const [textFlag, setTextFlag] = useState(false);
  const [ronCurrency, setRonCurrency] = useState(1);
  const [exchangeRateFlag, setExchangeRateFlag] = useState(true);
  const BASE_URL = "https://api.exchangerate.host/latest";
  const numberOfWorkingDays = 261;

  const handleSubmit = () => {
    setTextFlag(true);
  };

  const handleClick = () => {
    setExchangeRateFlag(!exchangeRateFlag);
    if (!exchangeRateFlag) {
      document.getElementById("exchangeRateRon").value = "";
    }
  };

  const handleOnChange = (value, type) => {
    if (value === "") {
      setErrorFlag(false);
      switch (type) {
        case "ron":
          setRonCurrency(0);
          break;
        case "price":
          setPricePerHour(0);
          break;
        case "hours":
          setHoursPerDay(0);
          break;
        default:
          break;
      }
    } else if (
      !value.match(/^[0-9]{0,2}[.]?[0-9]{0,3}$/) ||
      (type === "ron" && parseFloat(value) >= 100) ||
      (type === "price" && !value.match(/^[0-9]{0,3}[.]?[0-9]{0,6}$/)) ||
      (type === "hours" && parseFloat(value) > 12)
    ) {
      setErrorFlag(true);
    } else {
      setErrorFlag(false);
      switch (type) {
        case "ron":
          setRonCurrency(value);
          break;
        case "price":
          setPricePerHour(value);
          break;
        case "hours":
          setHoursPerDay(value);
          break;
        default:
          break;
      }
    }
  };

  const formatNumbers = (input) => {
    if (Number.isInteger(input)) {
      return input;
    }
    return input.toFixed(3);
  };

  const percentColors = [
    { pct: 0.1, color: { r: 0x00, g: 0xff, b: 0 } },
    { pct: 0.26, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 0.42, color: { r: 0xff, g: 0x00, b: 0 } },
  ];

  const getColorForPercentage = function (pct) {
    for (var i = 1; i < percentColors.length - 1; i++) {
      if (pct < percentColors[i].pct) {
        break;
      }
    }
    const lower = percentColors[i - 1];
    const upper = percentColors[i];
    const range = upper.pct - lower.pct;
    const rangePct = (pct - lower.pct) / range;
    const pctLower = 1 - rangePct;
    const pctUpper = rangePct;
    const color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
    };
    return "rgb(" + [color.r, color.g, color.b].join(",") + ")";
  };

  if (document.getElementById("td") != null) {
    document.getElementById("td").style.backgroundColor = getColorForPercentage(
      (netIncome / pricePerYearInRON) * -1 + 1
    );
    document.getElementById("td").style.color = "black";
  }

  useEffect(() => {
    setHoursPerYear(formatNumbers(numberOfWorkingDays * hoursPerDay));
    setPricePerYear(formatNumbers(hoursPerYear * pricePerHour));
    setPricePerYearInRON(formatNumbers(pricePerYear * ronCurrency));
    setCasFlag(pricePerYearInRON > minimumGrossWage * 12);
    setCassFlag(pricePerYearInRON > minimumGrossWage * 6);
    setMiddleLimitFlag(
      pricePerYearInRON > minimumGrossWage * 12 &&
        pricePerYearInRON < minimumGrossWage * 24
    );

    if (!middleLimitFlag) {
      setCassLowLimitFlag(
        pricePerYearInRON > minimumGrossWage * 6 &&
          pricePerYearInRON < minimumGrossWage * 12
      );
    }

    if (!cassFlag) {
      setCassValue(0);
      setCasValue(0);
    } else if (cassLowLimitFlag) {
      setCassValue(formatNumbers(minimumGrossWage * 6 * 0.1));
      setCasValue(0);
    } else if (middleLimitFlag) {
      setCassValue(formatNumbers(minimumGrossWage * 12 * 0.1));
      setCasValue(formatNumbers(minimumGrossWage * 12 * 0.25));
    } else {
      setCassValue(formatNumbers(minimumGrossWage * 24 * 0.1));
      setCasValue(formatNumbers(minimumGrossWage * 24 * 0.25));
    }

    setIncomeTax(
      formatNumbers((pricePerYearInRON - casValue - cassValue) * 0.1)
    );
    setNetIncome(formatNumbers(incomeTax * 9));
    setNetIncomeHour(formatNumbers(netIncome / hoursPerYear / ronCurrency));
    setTotalTaxes(Math.round(((netIncome / pricePerYearInRON) * -1 + 1) * 100));

    if (exchangeRateFlag) {
      fetch(`${BASE_URL}?base=EUR&symbols=RON`)
        .then((res) => res.json())
        .then((data) => setRonCurrency(formatNumbers(data.rates["RON"])));
    }
  });

  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <form style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "10px" }}>
          Exchange rate:{" "}
          <input
            type="text"
            name="exchange-rate-eur"
            disabled="true"
            value={1}
            style={{ width: "10px" }}
          />
          {" EURO ~ "}
          <input
            type="text"
            name="exchange-rate-ron"
            id="exchangeRateRon"
            disabled={exchangeRateFlag}
            onChange={(event) => handleOnChange(event.target.value, "ron")}
            maxLength="5"
            placeholder={ronCurrency}
            style={{ width: "35px" }}
          />
          {" RON"}
        </label>
        <label>
          Want custom exchange rate? Check this:{" "}
          <input type="checkbox" onClick={handleClick}></input>
        </label>
        <label style={{ marginBottom: "10px" }}>
          Price per hour (in EURO):{" "}
          <input
            type="text"
            name="price-per-hour"
            id="pricePerHour"
            onChange={(event) => handleOnChange(event.target.value, "price")}
            maxLength="9"
            placeholder="0"
          />
        </label>
        <label style={{ marginBottom: "10px" }}>
          Working hours per day:{" "}
          <input
            type="text"
            name="hours-per-day"
            id="hoursPerDay"
            onChange={(event) => handleOnChange(event.target.value, "hours")}
            maxLength="5"
            placeholder="0"
          />
        </label>
      </form>
      {errorFlag && <div style={{ color: "red" }}> Wrong input! </div>}
      {textFlag ? (
        <>
          <table>
            <tr>
              <th>HOURS/DAY</th>
              <th>HOURS/YEAR</th>
              <th>PRICE/YEAR IN €</th>
              <th>PRICE/YEAR IN RON</th>
              {casFlag && <th>CAS 25% IN RON</th>}
              {cassFlag && <th>CASS 10% IN RON</th>}
              <th>INCOME TAX 10% IN RON</th>
              <th>NET INCOME/YEAR IN RON</th>
              <th>NET INCOME/HOUR IN €</th>
              <th>TOTAL TAXES %</th>
            </tr>
            <tr>
              <td>{hoursPerDay}</td>
              <td>{hoursPerYear}</td>
              <td>{pricePerYear}</td>
              <td>{pricePerYearInRON}</td>
              {casFlag && <td>{casValue}</td>}
              {cassFlag && <td>{cassValue}</td>}
              <td>{incomeTax}</td>
              <td>{netIncome}</td>
              <td>{netIncomeHour}</td>
              <td id="td">{totalTaxes}</td>
            </tr>
          </table>
          <p style={{ display: "none" }}>
            LA {hoursPerDay} ORE: {hoursPerYear} ORE LUCRATE =&gt;{" "}
            {pricePerYear}
            €/AN ~ {pricePerYearInRON} RON/AN =&gt;{" "}
            {casFlag && (
              <span>
                CAS 25%{" "}
                {middleLimitFlag ? (
                  <span>(36000 * 0.25 = 9000)</span>
                ) : (
                  <span>(72000 * 0.25 = 18000)</span>
                )}
                ;{" "}
              </span>
            )}
            {cassFlag && (
              <span>
                CASS 10%{" "}
                {cassLowLimitFlag ? (
                  <span>(18000 * 0.1 = 1800)</span>
                ) : middleLimitFlag ? (
                  <span>(36000 * 0.1 = 3600)</span>
                ) : (
                  <span>(72000 * 0.1 = 7200)</span>
                )}
                ;
              </span>
            )}{" "}
            IMPOZIT PE VENIT 10% =&gt; ({pricePerYearInRON}
            {casFlag && <span> - {casValue}</span>}
            {cassFlag && <span> - {cassValue}</span>}) * 0.9 = {netIncome}{" "}
            RON/AN IN MANA ~ {totalTaxes}% TAXE
          </p>
        </>
      ) : (
        <button onClick={handleSubmit}>Get Taxes</button>
      )}
    </div>
  );
}

export default App;
