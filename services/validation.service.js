export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateUsername = (username) => {
    return username.length >= 3;
}

export const validateCarNumber = (carNumber) => {
    const carNumberRegex = /^[0-9]{7,8}$/;
    return carNumberRegex.test(carNumber);
}

export const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^[0-9]{10}$/;
    return phoneNumberRegex.test(phoneNumber);
}

export const validateLicenseNumber = (licenseNumber) => {
    const licenseNumberRegex = /^[0-9]{7}$/;
    return licenseNumberRegex.test(licenseNumber);
}

export const validateVehicleModel = (vehicleModel) => {
    const vehicleModelRegex = /^[a-zA-Z0-9]{1,20}$/;
    return vehicleModelRegex.test(vehicleModel);
}

export const validateID = (id) => {
    const idRegex = /^[0-9]{9}$/;
    return idRegex.test(id);
}