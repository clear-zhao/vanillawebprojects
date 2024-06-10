const arr = [1, 2, 3, 4, 1, 2, 3, 4];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 2) arr.splice(i, 1);
  console.log(arr.length);
  console.log(i);
}
arr;

const arr2 = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1];
arr2.forEach((a, index, arr) => {
  if (a === 3) arr2.splice(index, 1);
  console.log(arr);
  console.log(index);
});
arr2;

const arr3 = [
  [1, 2],
  [2, 3],
];
const [...arr4] = arr3;
arr4;
arr3[0] = 1;
arr3;
arr4;

const arr5 = [1, 2];
const arr6 = [3, 4];
let [arr7, arr8] = [arr5, arr6];
arr7;
arr8;
arr5[0] = 5;
arr7;
