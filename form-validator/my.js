const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const form = document.getElementById("form");

const showError = function (input, message) {
  // 加类名
  const formControl = input.parentElement;
  formControl.className = "form-control error";

  // 添加错误信息
  const small = formControl.querySelector("small");
  small.innerText = message;
};

const showSuccess = function (input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
};

const getFieldName = function (input) {
  const inputControl = input.parentElement;
  const label = inputControl.querySelector("label");
  return label.innerText;
};

// 查看是不是都填了
const checkRequired = function (inputArr) {
  inputArr.forEach((input) => {
    if (input.value === "") {
      showError(input, `${getFieldName(input)}不能为空！！！`);
      return false;
    }
  });
  return true;
};

// 查看长度是否符合要求
const checkLength = function (input, min, max) {
  const value = input.value;
  if (value.length < min) {
    showError(input, `${getFieldName(input)}长度不能少于${min}个字符！`);
    return false;
  }
  if (value.length > max) {
    showError(input, `${getFieldName(input)}长度不能长于${max}个字符！`);
    return false;
  }
  return true;
};

// 查看email格式是否正确
const checkEmail = function (input) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const value = input.value;
  if (re.test(value) === false) {
    showError(input, `${getFieldName(input)}格式错误！`);
    return false;
  }
  return true;
};

// 密码是否相同
const checkPasswordsMatch = function (input1, input2) {
  const password1 = input1.value;
  const password2 = input2.value;
  if (password1 !== password2) {
    showError(input1, "");
    showError(
      input2,
      `${getFieldName(input2)}与${getFieldName(input1)}不一致！`
    );
    return false;
  }
  return true;
};

// 验证表单
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (checkRequired([username, email, password, password2])) {
    if (checkLength(username, 2, 10)) {
      showSuccess(username);
    }
    if (checkEmail(email)) {
      showSuccess(email);
    }
    if (checkLength(password, 6, 10)) {
      if (checkPasswordsMatch(password, password2)) {
        showSuccess(password);
        showSuccess(password2);
      }
    }
  }

  //   const result =
  //     checkRequired([username, email, password, password2]) &&
  //     checkLength(username, 2, 10) &&
  //     checkEmail(email) &&
  //     checkLength(password, 6, 10) &&
  //     checkPasswordsMatch(password, password2);

  //   if (result) {
  //     [username, email, password, password2].forEach((el) => {
  //       el.parentElement.className = "form-control success";
  //     });
  //   } else {
  //     [password, password2].forEach((el) => {
  //       el.value = "";
  //     });
  //   }
});
