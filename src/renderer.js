/** 
 * This file is part of Minos
 *
 * Copyright (C) 2023 ebmaj7 <ebmaj7@proton.me>
 *
 * Minos is a hack. You can use it according to the terms and
 * conditions of the Hacking License (see licenses/HACK.txt)
 */ 

import { strings } from './modules/strings.js';
import { enable, disable, isLetter, isDigit, disableInput, hideComponent, showComponent, getElementsByIds } from './modules/util.js';
import { setupText } from './modules/setuptext.js';

const setupTooltips = () => {
	for(const button of document.getElementsByTagName('button')){
		const ttext = button.getAttribute('tooltip');
		if(ttext){
			// add tooltip to DOM
			const tooltip = document.createElement('div');
			hideComponent(tooltip);
			tooltip.classList.add('tooltip');
			document.getElementsByTagName('body')[0].appendChild(tooltip);
			// setup event listeners
			button.addEventListener('mouseenter', (event) => {
				if(button.classList.contains('disabled') && tooltip.classList.contains('hidden')){ // show tooltip only when button is disabled
					const {x, y, width, height} = event.target.getBoundingClientRect();
					tooltip.style.left = `${x - 30}px`;
					tooltip.style.top = `${y + height + 5}px`;
					tooltip.innerText = button.getAttribute('tooltip');
					showComponent(tooltip);
				}
				else 
					hideComponent(tooltip);
			});
			button.addEventListener('mouseleave', (event) => {
				hideComponent(tooltip);
			});
			tooltip.addEventListener('mouseenter', (event) => {
				showComponent(tooltip);
			});
			tooltip.addEventListener('mouseleave', (event) => {
				hideComponent(tooltip);
			})
		}
	}
};

const onDOMContentLoaded = () => {
	setupText();
	setupTooltips();
	/* variables */
	let page = 0;
	const [mainButton, topButton, urlBox, textarea, reportButton, reportLabel, nextButton, prevButton] = getElementsByIds(['main-button', 'top-button', 'url-box', 'report', 'report-button', 'report-label',  'button-next', 'button-prev']);
	const [formLabel, formName, formSurname, formBirthdate, formBirthplace, formFisccode, formAddress] = getElementsByIds(['form-label', 'form-name', 'form-surname', 'form-birthdate', 'form-birthplace', 'form-fisccode', 'form-address']);
	const [formPhone, formPaddr, formEmail, formFax] = getElementsByIds(['form-phone', 'form-paddr', 'form-email', 'form-fax']);
	const [checkPhone, checkPaddr, checkEmail, checkFax] = getElementsByIds(['check-phone', 'check-paddr', 'check-email', 'check-fax']);
	const pageValid = [false, false, false, false];

	/* functions */
	const onClickStart = (event) => {
		// run only the 1st time
		const URL = urlBox.value; 
		if(URL.length !== 0){
			window.electronAPI.start(URL);
			const button = event.target;
			button.innerText = strings.components.topBar.button.analyze;
			disableInput(urlBox);
			// clicked for the 2nd time (analyze)
			button.addEventListener('click', () => {
				window.electronAPI.analyze();
			}, { once: true });
			button.removeEventListener('click', onClickStart);
		}
	};

	// return err, which is used to determine whether a given 
	// page is valid or not and possibly it is displayed as tooltip
	// above the nextButton
	const validateForm = () => {
		let err = undefined;
		switch(page){
			case 0:
				// first remove invalid from all form elements
				[formName, formSurname, formBirthdate, formBirthplace, formFisccode, formAddress].forEach(target => target.classList.remove('invalid'));
				// then possibly re-add invalid and display error tooltip above next button
				if(formAddress.value.length === 0){
					formAddress.classList.add('invalid');
					err = strings.err.emptyField;
				}
				if(!formFisccode.value.match(/[A-Z]{3}[A-Z]{3}[0-9]{2}[ABCDEHLMPRST]((0[1-9]|[1-2][0-9]|3[0-1])|([4-6][1-9]|7[0-1]))[A-Z][0-9]{3}[A-Z]/g)){
					formFisccode.classList.add('invalid');
					err = strings.err.invalidFiscCode;
				}
				if(formBirthplace.value.length === 0){
					formBirthplace.classList.add('invalid');
					err = strings.err.emptyField;
				}
				if(!formBirthdate.value.match(/((0[1-9]|1[0-9]|2[0-9]|30)\/(04|06|09|11)\/([1-2][0-9]{3}))|((0[1-9]|1[0-9]|2[0-9])\/02\/([1-2][0-9]{3}))|((0[1-9]|1[0-9]|2[0-9]|3[0-1])\/(01|03|05|07|08|10|12)\/([1-2][0-9]{3}))/g)){
					formBirthdate.classList.add('invalid');
					err = strings.err.invalidBirthDate;
				}
				if(formSurname.value.length === 0){
					formSurname.classList.add('invalid');
					err = strings.err.emptyField;
				}
				if(formName.value.length === 0){
					formName.classList.add('invalid');
					err = strings.err.emptyField;
				}
				return err;
			case 1:
				// if none checked => error
				if([checkPhone, checkPaddr, checkEmail, checkFax].every(checkbox => !checkbox.checked))
					err = strings.err.missingContact;
				['phone', 'paddr', 'email', 'fax'].forEach((field) => {
					const checkBox = document.getElementById(`check-${field}`);	
					const formComponent = document.getElementById(`form-${field}`);

				});
				return err;
			case 2:
				return err;
			case 3:
				return err;
			default:
				return err;
		}
	};

	const formHandler = () => {
		const err = validateForm();
		if(err){
			pageValid[page] = false;
			disable(nextButton);
			nextButton.setAttribute('tooltip', err);
		} else {
			pageValid[page] = true;
			enable(nextButton);
		}
	};

	/* event listeners */
	mainButton.addEventListener('click', () => {
		hideComponent(document.getElementById('main'));
		showComponent(document.getElementById('top-bar'));
	});

	urlBox.addEventListener('input', (event) => {
		if(event.target.value.length === 0)
			disable(topButton);
		else 
			enable(topButton);
	});

	topButton.addEventListener('click', onClickStart); 

	// add event listeners to checkboxes
	['phone', 'paddr', 'email', 'fax'].forEach((field) => {
		const checkBox = document.getElementById(`check-${field}`);	
		const container = document.getElementById(`${field}-container`);
		checkBox.addEventListener('change', (event) => {
			if(event.target.checked){
				showComponent(container);
			} else {
				hideComponent(container);
			}
		});
	});

	formName.addEventListener('input', formHandler);
	formSurname.addEventListener('input', formHandler);
	formFisccode.addEventListener('input', formHandler);
	formBirthplace.addEventListener('input', formHandler);
	formAddress.addEventListener('input', formHandler);
	formBirthdate.addEventListener('input', formHandler);
	formFisccode.addEventListener('keydown', (event) => {
		// insert only uppercase letters
		if(event.code !== "Tab" && event.code !== "Backspace" && event.code !== "ArrowLeft" && event.code !== "ArrowRight"){
			if(event.target.value.length < 16 && (isLetter(event.key) || isDigit(event.key))){
				event.preventDefault();
				const curPos = event.target.selectionStart;
				event.target.value = event.target.value.slice(0, curPos) + event.key.toUpperCase() + event.target.value.slice(curPos);
				event.target.selectionStart = curPos + 1;
				event.target.selectionEnd = curPos + 1;
			} else {
				event.preventDefault();
			}
		} 
		formHandler();
	});

	formBirthdate.addEventListener('keydown', (event) => {
		const addSlashes = (date) => { 
			if(date.length >= 4)
				return date.slice(0, 2) + "/" + date.slice(2, 4) + "/" + date.slice(4);
			else if(date.length >= 2)
				return date.slice(0, 2) + "/" + date.slice(2);
			else
				return date;
		};
		const curText = event.target.value;
		const textPos = event.target.selectionStart;
		// remove slashes
		const curDate = curText.replaceAll('/', '');
		const datePos = textPos >= 6 ? textPos - 2 : (textPos >= 3 ? textPos - 1 : textPos);
		// if there's a backspace delete backspace + number
		if(event.code === "Backspace"){
			event.preventDefault();
			const newDate = curDate.slice(0, datePos - 1) + curDate.slice(datePos);	
			event.target.value = addSlashes(newDate);
			const nextPos = [3,6].some(x => x === textPos) ? textPos - 2 : textPos - 1;
			event.target.selectionStart = nextPos;
			event.target.selectionEnd = nextPos;
		} else if(event.code !== "Tab" && event.code !== "Backspace" && event.code !== "ArrowLeft" && event.code !== "ArrowRight"){
			event.preventDefault();
			// only allow numbers
			if(Array.from(Array(10).keys()).map(x => String(x)).some(x => x === event.key) && curDate.length < 8){
				// compute new date
				const newDate = curDate.slice(0, datePos) + event.key + curDate.slice(datePos);
				event.target.value = addSlashes(newDate);
				const nextPos = [1,2,4,5].some(x => x === textPos) ? textPos + 2 : textPos + 1;
				event.target.selectionStart = nextPos;
				event.target.selectionEnd = nextPos;
			}
		}
		formHandler();
	});

	nextButton.addEventListener('mouseenter', formHandler);

	nextButton.addEventListener('click', (event) => {
		if(event.target.classList.contains('disabled'))
			return;
		if(pageValid[page + 1])
			enable(nextButton);
		else
			disable(nextButton);
		switch(page){
			case 0:
				hideComponent(document.getElementById('form-fields-1'));
				showComponent(document.getElementById('form-fields-2'));
				showComponent(prevButton);
				enable(prevButton);
				formLabel.innerText = strings.components.form.pages[1];
				nextButton.setAttribute('tooltip', strings.err.missingContact);
				page++;
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
		}
	});

	prevButton.addEventListener('click', (event) => {
		if(event.target.classList.contains('disabled'))
			return;
		if(pageValid[page - 1])
			enable(nextButton);
		else
			disable(nextButton);
		switch(page){
			case 1:
				hideComponent(document.getElementById('form-fields-2'));
				showComponent(document.getElementById('form-fields-1'));
				hideComponent(prevButton);
				formLabel.innerText = strings.components.form.pages[0];
				page--;
				break;
			case 2:
				break;
			case 3:
				break;
		}
	});

	// on page navigation, update the URL in the urlBox
	window.electronAPI.onChangeURL((event, url) => {
		urlBox.value = url;
	});
	window.electronAPI.onBadRequests((event, data) => {
		hideComponent(document.getElementById('top-bar'));
		showComponent(document.getElementById('report-container'));
		reportLabel.innerText += " " + data.logfile + ". ";
		if(data.requests.length > 0){
			reportLabel.innerText += `\r\n${strings.components.report.badHostsDetected}`
			textarea.value = data.requests
				.map(d => d.hosts.source + ": " + d.hosts.values.map(v => String(v)).join()) // transform into string
				.filter((val, idx, arr) => arr.indexOf(val) === idx) // remove duplicates
				.reduce((a, b) => a + b + "\r\n", ""); // add cr and newline
			reportButton.addEventListener('click', () => {
				hideComponent(document.getElementById('report-container'));
				showComponent(document.getElementById('form-container'))
			});
		} else {
			reportLabel.innerText += `\r\n${strings.components.report.noBadHostsDetected}`
			hideComponent(textarea);
			hideComponent(reportButton);
		}
	});
};

window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
