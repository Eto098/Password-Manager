document.getElementById("uploadBtn").onchange = function () {
    document.getElementById("currDbName").value = this.value.split(/(\\|\/)/g).pop();
};
