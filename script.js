function formatIndianNumber(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function formatIndianCurrency(amount) {
    const formattedAmount = formatIndianNumber(Math.round(amount * 100) / 100);
    return '₹' + formattedAmount;
}

function getTextualRepresentation(amount) {
    const crore = Math.floor(amount / 10000000);
    const lakh = Math.floor((amount % 10000000) / 100000);
    const thousand = Math.floor((amount % 100000) / 1000);

    let result = '';
    if (crore > 0) {
        result += `${crore} crore${lakh > 0 ? ' ' + lakh + ' lakh' : ''}`;
        return result + (amount % 10000000 > 0 ? ' +' : '');
    } else if (lakh > 0) {
        result += `${lakh} lakh${thousand > 0 ? ' ' + thousand + ' thousand' : ''}`;
        return result + (amount % 100000 > 0 ? ' +' : '');
    } else if (thousand > 0) {
        return `${thousand} thousand${amount % 1000 > 0 ? ' +' : ''}`;
    } else {
        return formatIndianCurrency(amount);
    }
}

function calculateTax(salary) {
    let tax = 0;
    let taxBreakdown = [];

    if (salary > 1500000) {
        let taxableAmount = salary - 1500000;
        let taxForThisSlab = taxableAmount * 0.3;
        tax += taxForThisSlab;
        taxBreakdown.push(`30% tax on ${formatIndianCurrency(taxableAmount)}: ${formatIndianCurrency(taxForThisSlab)}`);
        salary = 1500000;
    }
    if (salary > 1200000) {
        let taxableAmount = salary - 1200000;
        let taxForThisSlab = taxableAmount * 0.2;
        tax += taxForThisSlab;
        taxBreakdown.push(`20% tax on ${formatIndianCurrency(taxableAmount)}: ${formatIndianCurrency(taxForThisSlab)}`);
        salary = 1200000;
    }
    if (salary > 1000000) {
        let taxableAmount = salary - 1000000;
        let taxForThisSlab = taxableAmount * 0.15;
        tax += taxForThisSlab;
        taxBreakdown.push(`15% tax on ${formatIndianCurrency(taxableAmount)}: ${formatIndianCurrency(taxForThisSlab)}`);
        salary = 1000000;
    }
    if (salary > 700000) {
        let taxableAmount = salary - 700000;
        let taxForThisSlab = taxableAmount * 0.1;
        tax += taxForThisSlab;
        taxBreakdown.push(`10% tax on ${formatIndianCurrency(taxableAmount)}: ${formatIndianCurrency(taxForThisSlab)}`);
        salary = 700000;
    }
    if (salary > 300000) {
        let taxableAmount = salary - 300000;
        let taxForThisSlab = taxableAmount * 0.05;
        tax += taxForThisSlab;
        taxBreakdown.push(`5% tax on ${formatIndianCurrency(taxableAmount)}: ${formatIndianCurrency(taxForThisSlab)}`);
    }

    return { totalTax: tax, breakdown: taxBreakdown.reverse() };
}

function calculateSalary() {
    const baseSalary = parseFloat(document.getElementById('baseSalary').value);
    if (isNaN(baseSalary)) {
        alert('Please enter a valid number');
        return;
    }
    const { totalTax, breakdown } = calculateTax(baseSalary);
    const monthlySalary = (baseSalary - totalTax) / 12;
    const result = `
    <div class="result-section">
        <h3>Salary Breakdown</h3>
        <div class="result-item"><strong>Annual CTC:</strong> ${formatIndianCurrency(baseSalary)} (${getTextualRepresentation(baseSalary)})</div>
        <div class="result-item"><strong>Annual Tax:</strong> ${formatIndianCurrency(totalTax)} (${getTextualRepresentation(totalTax)})</div>
        <div class="result-item"><strong>Annual In-hand:</strong> ${formatIndianCurrency(baseSalary - totalTax)} (${getTextualRepresentation(baseSalary - totalTax)})</div>
        <div class="result-item"><strong>Monthly In-hand:</strong> ${formatIndianCurrency(monthlySalary)} (${getTextualRepresentation(monthlySalary)})</div>
    </div>
    <div class="result-section">
        <h3>Tax Breakdown</h3>
        ${breakdown.map(item => `<div class="result-item">${item}</div>`).join('')}
    </div>
    `;
    document.getElementById('result').innerHTML = result;
}

function calculateCTC() {
    const desiredMonthlySalary = parseFloat(document.getElementById('desiredSalary').value);
    if (isNaN(desiredMonthlySalary)) {
        alert('Please enter a valid number');
        return;
    }
    let lowCTC = desiredMonthlySalary * 12;
    let highCTC = desiredMonthlySalary * 24; // Arbitrary upper bound
    let midCTC, inHand;

    while (highCTC - lowCTC > 1) {
        midCTC = (lowCTC + highCTC) / 2;
        inHand = (midCTC - calculateTax(midCTC).totalTax) / 12;
        if (inHand > desiredMonthlySalary) {
            highCTC = midCTC;
        } else {
            lowCTC = midCTC;
        }
    }

    const requiredCTC = Math.ceil(midCTC);
    const { totalTax, breakdown } = calculateTax(requiredCTC);
    const result = `
    <div class="result-section">
        <h3>CTC Breakdown</h3>
        <div class="result-item"><strong>Required Annual CTC:</strong> ${formatIndianCurrency(requiredCTC)} (${getTextualRepresentation(requiredCTC)})</div>
        <div class="result-item"><strong>Estimated Annual Tax:</strong> ${formatIndianCurrency(totalTax)} (${getTextualRepresentation(totalTax)})</div>
        <div class="result-item"><strong>Estimated Annual In-hand:</strong> ${formatIndianCurrency(requiredCTC - totalTax)} (${getTextualRepresentation(requiredCTC - totalTax)})</div>
        <div class="result-item"><strong>Estimated Monthly In-hand:</strong> ${formatIndianCurrency((requiredCTC - totalTax) / 12)} (${getTextualRepresentation((requiredCTC - totalTax) / 12)})</div>
    </div>
    <div class="result-section">
        <h3>Tax Breakdown</h3>
        ${breakdown.map(item => `<div class="result-item">${item}</div>`).join('')}
    </div>
    `;
    document.getElementById('ctcResult').innerHTML = result;
}

function toggleCalculator() {
    const salaryCalc = document.getElementById('salaryCalculator');
    const ctcCalc = document.getElementById('ctcCalculator');
    const toggleButton = document.getElementById('toggleButton');
    if (salaryCalc.style.display === 'none') {
        salaryCalc.style.display = 'block';
        ctcCalc.style.display = 'none';
        toggleButton.textContent = 'Switch to Required Base Calculator';
    } else {
        salaryCalc.style.display = 'none';
        ctcCalc.style.display = 'block';
        toggleButton.textContent = 'Switch to In-hand Calculator';
    }
}