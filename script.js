
const form = document.getElementById("regForm");
const steps = document.querySelectorAll(".step");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const saveBtn = document.getElementById("saveBtn");

const stepText = document.getElementById("stepText");
const progressBar = document.getElementById("progressBar");
const summary = document.getElementById("summary");
const success = document.getElementById("success");
const employmentError = document.getElementById("employmentError");

let currentStep = 0;

const programs = {
    "College of Information Technology": [
        "BS Information Technology",
        "BS Computer Science",
        "BS Information Systems",
        "BS Entertainment and Multimedia Computing"
    ],
    "College of Engineering": [
        "BS Civil Engineering",
        "BS Electrical Engineering",
        "BS Mechanical Engineering",
        "BS Electronics Engineering",
        "BS Computer Engineering"
    ],
    "College of Business and Accountancy": [
        "BS Accountancy",
        "BS Business Administration - Marketing",
        "BS Business Administration - Financial Management",
        "BS Entrepreneurship"
    ],
    "College of Education": [
        "Bachelor of Elementary Education",
        "Bachelor of Secondary Education",
        "Bachelor of Physical Education"
    ],
    "College of Arts and Sciences": [
        "BA Communication",
        "BS Psychology",
        "BS Biology",
        "BS Mathematics",
        "BA Political Science"
    ],
    "College of Nursing and Allied Health": [
        "BS Nursing",
        "BS Medical Technology",
        "BS Pharmacy",
        "BS Physical Therapy"
    ],
    "College of Hospitality and Tourism Management": [
        "BS Hospitality Management",
        "BS Tourism Management"
    ]
};

const college = document.getElementById("college");
const course = document.getElementById("course");

function updateCourses(selectedCourse = "") {
    const list = programs[college.value] || [];

    course.innerHTML = '<option value="">Select program</option>';

    list.forEach(program => {
        const option = document.createElement("option");
        option.value = program;
        option.textContent = program;
        course.appendChild(option);
    });

    course.disabled = list.length === 0;

    if (selectedCourse && list.includes(selectedCourse)) {
        course.value = selectedCourse;
    }
}

college.addEventListener("change", () => {
    updateCourses();
    validateField(college);
});

function getContainer(element) {
    return element.closest(".field") ||
           element.closest(".check") ||
           element.parentElement;
}

function showError(element, message) {
    const container = getContainer(element);

    if (!container) return message === "";

    const oldError = container.querySelector(".err");

    if (oldError) {
        oldError.remove();
    }

    element.classList.toggle("invalid", !!message);
    element.setAttribute("aria-invalid", message ? "true" : "false");

    if (message) {
        const error = document.createElement("span");
        error.className = "err";
        error.textContent = message;
        container.appendChild(error);
    }

    return message === "";
}

const rules = {
    first_name: value =>
        !value ? "First name is required." :
        !/^[A-Za-zÀ-ÿ.' -]{2,}$/.test(value) ?
        "Enter a valid first name." : "",

    last_name: value =>
        !value ? "Last name is required." :
        !/^[A-Za-zÀ-ÿ.' -]{2,}$/.test(value) ?
        "Enter a valid last name." : "",

    middle_name: value =>
        value && !/^[A-Za-zÀ-ÿ.' -]+$/.test(value) ?
        "Enter a valid middle name." : "",

    birth_date: value => {
        if (!value) return "Date of birth is required.";

        const birth = new Date(value + "T00:00:00");
        const today = new Date();

        if (isNaN(birth.getTime()) || birth > today) {
            return "Enter a valid date of birth.";
        }

        let age = today.getFullYear() - birth.getFullYear();

        const birthdayNotReached =
            today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() &&
             today.getDate() < birth.getDate());

        if (birthdayNotReached) age--;

        return age < 15 ? "Minimum age is 15." : "";
    },

    gender: value =>
        !value ? "Please select a gender." : "",

    contact: value =>
        !value ? "Contact number is required." :
        !/^(09\d{9}|\+639\d{9})$/.test(value.replace(/[\s-]/g, "")) ?
        "Use 09XXXXXXXXX or +639XXXXXXXXX." : "",

    email: value =>
        !value ? "Email is required." :
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ?
        "Enter a valid email address." : "",

    address: value =>
        !value ? "Address is required." :
        value.length < 10 ? "Enter your complete address." : "",

    student_no: value =>
        !value ? "Student number is required." :
        !/^[A-Za-z0-9-]{5,15}$/.test(value) ?
        "Use 5-15 letters, numbers, or dashes." : "",

    college: value =>
        !value ? "Please select a college." : "",

    course: value =>
        !value ? "Please select a program." : "",

    year_level: value =>
        !value ? "Please select a year level." : "",

    graduation: value => {
        if (!value) return "Graduation date is required.";

        const now = new Date();
        const currentMonth =
            now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0");

        return value < currentMonth ?
            "Graduation date cannot be in the past." : "";
    },

    gwa: value => {
        if (!value) return "GWA is required.";

        const number = Number(value);

        return !Number.isFinite(number) || number < 1 || number > 5 ?
            "GWA must be between 1.00 and 5.00." : "";
    },

    objective: value =>
        !value ? "Career objective is required." :
        value.length < 20 ? "Write at least 20 characters." : "",

    tech_skills: value =>
        !value ? "List your technical skills." : "",

    job_position: value =>
        !value ? "Job position is required." : "",

    industry: value =>
        !value ? "Select an industry." : "",

    work_location: value =>
        !value ? "Work location is required." : "",

    salary: value =>
        value && Number(value) < 0 ?
        "Salary cannot be negative." : "",

    username: value =>
        !value ? "Username is required." :
        !/^[A-Za-z0-9_]{4,20}$/.test(value) ?
        "Use 4-20 letters, numbers, or underscores." : "",

    password: value =>
        !value ? "Password is required." :
        value.length < 8 ? "Minimum 8 characters." :
        !/[a-z]/.test(value) ? "Add a lowercase letter." :
        !/[A-Z]/.test(value) ? "Add an uppercase letter." :
        !/\d/.test(value) ? "Add a number." : "",

    confirm_password: value =>
        !value ? "Confirm your password." :
        value !== form.elements.password.value ?
        "Passwords do not match." : ""
};

function validateField(element) {
    const name = element.name;

    if (name === "accurate" || name === "privacy") {
        return showError(
            element,
            element.checked ? "" : "This confirmation is required."
        );
    }

    if (rules[name]) {
        return showError(
            element,
            rules[name](element.value.trim())
        );
    }

    if (!element.checkValidity()) {
        return showError(
            element,
            element.validationMessage || "Please enter a valid value."
        );
    }

    return showError(element, "");
}

function validateEmployment() {
    const boxes = form.querySelectorAll('input[name="emp_type[]"]');
    const selected = [...boxes].some(box => box.checked);

    employmentError.innerHTML = "";

    if (!selected) {
        const error = document.createElement("span");
        error.className = "err";
        error.textContent = "Select at least one employment type.";
        employmentError.appendChild(error);
    }

    return selected;
}

function validateStep() {
    const fields = steps[currentStep].querySelectorAll(
        "input[name], select[name], textarea[name]"
    );

    let valid = true;
    let firstInvalid = null;

    fields.forEach(element => {
        if (element.name === "emp_type[]") return;

        if (!validateField(element)) {
            valid = false;

            if (!firstInvalid) {
                firstInvalid = element;
            }
        }
    });

    if (currentStep === 3 && !validateEmployment()) {
        valid = false;

        if (!firstInvalid) {
            firstInvalid = form.querySelector('input[name="emp_type[]"]');
        }
    }

    if (!valid && firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    return valid;
}

function showStep(step) {
    steps.forEach((section, index) => {
        section.classList.toggle("active", index === step);
    });

    currentStep = step;

    stepText.textContent = `Step ${step + 1} of ${steps.length}`;

    progressBar.style.width =
        `${((step + 1) / steps.length) * 100}%`;

    prevBtn.disabled = step === 0;
    nextBtn.hidden = step === steps.length - 1;
    submitBtn.hidden = step !== steps.length - 1;

    summary.style.display = "none";
    success.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

nextBtn.addEventListener("click", () => {
    if (validateStep() && currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    }
});

prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        showStep(currentStep - 1);
    }
});

form.querySelectorAll("input, select, textarea").forEach(element => {
    if (element.name === "emp_type[]") {
        element.addEventListener("change", validateEmployment);
        return;
    }

    element.addEventListener("blur", () => validateField(element));

    element.addEventListener("input", () => {
        if (element.classList.contains("invalid")) {
            validateField(element);
        }
    });

    element.addEventListener("change", () => {
        if (element.classList.contains("invalid")) {
            validateField(element);
        }
    });
});

form.elements.password.addEventListener("input", () => {
    const confirmPassword = form.elements.confirm_password;

    if (confirmPassword.value) {
        validateField(confirmPassword);
    }
});

saveBtn.addEventListener("click", () => {
    const draft = {};
    const data = new FormData(form);

    for (const [key, value] of data.entries()) {
        if (draft[key] !== undefined) {
            if (!Array.isArray(draft[key])) {
                draft[key] = [draft[key]];
            }

            draft[key].push(value);
        } else {
            draft[key] = value;
        }
    }

    draft.currentStep = currentStep;

    localStorage.setItem("unicareerDraft", JSON.stringify(draft));

    alert("Your registration draft has been saved.");
});

function loadDraft() {
    const saved = localStorage.getItem("unicareerDraft");

    if (!saved) return;

    const draft = JSON.parse(saved);

    Object.keys(draft).forEach(key => {
        if (key === "currentStep") return;

        const elements = form.querySelectorAll(`[name="${key}"]`);

        if (!elements.length) return;

        if (elements[0].type === "checkbox") {
            elements.forEach(element => {
                element.checked = Array.isArray(draft[key]) ?
                    draft[key].includes(element.value) :
                    Boolean(draft[key]);
            });
        } else if (key === "course") {
            updateCourses(draft[key]);
        } else {
            elements[0].value = draft[key];
        }
    });

    const savedStep = Number(draft.currentStep);

    if (Number.isInteger(savedStep) &&
        savedStep >= 0 &&
        savedStep < steps.length) {
        showStep(savedStep);
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();

    let errors = 0;
    let firstInvalid = null;

    form.querySelectorAll("input[name], select[name], textarea[name]")
        .forEach(element => {
            if (element.name === "emp_type[]") return;

            if (!validateField(element)) {
                errors++;

                if (!firstInvalid) {
                    firstInvalid = element;
                }
            }
        });

    if (!validateEmployment()) {
        errors++;

        if (!firstInvalid) {
            firstInvalid = form.querySelector('input[name="emp_type[]"]');
        }
    }

    if (errors > 0) {
        const invalidStep = firstInvalid.closest(".step");
        const stepIndex = [...steps].indexOf(invalidStep);

        if (stepIndex !== -1) {
            showStep(stepIndex);
        }

        summary.textContent =
            `Please correct the ${errors} invalid field(s) before submitting.`;

        summary.style.display = "block";

        firstInvalid.focus();
        firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }

    summary.style.display = "none";

    success.textContent =
        "Registration completed successfully! This is a demo only.";

    success.style.display = "block";

    localStorage.removeItem("unicareerDraft");

    alert("Your UniCareer registration is complete!");
});

loadDraft();
showStep(currentStep);
