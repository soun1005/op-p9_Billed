/**
 * @jest-environment jsdom
 */

import mockStore from "../__mocks__/store"
import { fireEvent, getByTestId, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import {localStorageMock} from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee on the new bill page", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill forms should appear", () => {
      document.body.innerHTML = NewBillUI()
      const expenseType = screen.getByTestId("expense-type")
      const expenseName = screen.getByTestId("expense-name")
      const amount = screen.getByTestId("amount")
      const datePicker = screen.getByTestId("datepicker")
      const vat = screen.getByTestId("vat")
      const pct = screen.getByTestId("pct")
      const commentary = screen.getByTestId("commentary")
      expect(expenseType).toBeTruthy()
      expect(expenseName).toBeTruthy()
      expect(amount).toBeTruthy()
      expect(datePicker).toBeTruthy()
      expect(vat).toBeTruthy()
      expect(pct).toBeTruthy()
      expect(commentary).toBeTruthy()
    })
  })

  describe("When I click add file button", () => {
    test("Then I should be navigated to choose a file", () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // add file button
      const addFileBtn = screen.getByTestId("file")
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: null})
      // click event of file button
      const handleChangeFile = jest.fn(() => { testNewbill.handleChangeFile }) 
      addFileBtn.addEventListener('click', handleChangeFile)
      userEvent.click(addFileBtn)
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })

  // handleChangeFile test
  describe("When I choose a file with correct form of extension file to upload", () => {
    test("Then the chosen file should be uploaded", () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: mockStore})

      // add file button
      const addFileBtn = screen.getByTestId("file")
      expect(addFileBtn).toBeTruthy()

      // create file to upload
      const file = new File(["image"], "image.jpg", {type: "image/jpeg"})

      // fire upload
      const handleChangeFile = jest.fn(() => { testNewbill.handleChangeFile }) 
      addFileBtn.addEventListener("change", handleChangeFile)
      fireEvent.change(addFileBtn, { target: { files: [file] }})
      
      // check calls
      expect(handleChangeFile).toHaveBeenCalled()
      expect(addFileBtn.files).toHaveLength(1)
      expect(addFileBtn.files[0].name).toBe("image.jpg")
    })
  })

  // handleChangeFile image type test
  describe("When I choose a file with incorrect form of extension of file to upload", () => {
    test("It shouldn't be uploaded", () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: mockStore})

      // add file button
      const addFileBtn = screen.getByTestId("file")
      expect(addFileBtn).toBeTruthy()

      // create file to upload
      const file = new File(["image"], "image.jpg", {type: "file/pdf"})

      // fire upload
      const handleChangeFile = jest.fn(() => { testNewbill.handleChangeFile }) 
      addFileBtn.addEventListener("change", handleChangeFile)
      fireEvent.change(addFileBtn, { target: { files: [file] }})
      
      // check calls
      expect(handleChangeFile).toHaveBeenCalled()
      expect(addFileBtn.files[0].name).not.toBe("file.jpg")
    })
  })


})

describe("Given I am connected as an employee on the new bill page", () => {
  describe("When I fill up the forms correctly and click submit button", () => {
    test("It should make a new bill", () => {
      // codes
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // instance of NewBill
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: null})
      // submit button
      const submitBtn = screen.getByTestId("form-new-bill")

      // mock data
      const inputData = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        pct: 20
      }
      screen.getByTestId("expense-type").value = inputData.type
      screen.getByTestId("expense-name").value = inputData.name
      screen.getByTestId("amount").value = inputData.amount
      screen.getByTestId("datepicker").value = inputData.date
      screen.getByTestId("vat").value = inputData.vat
      screen.getByTestId("pct").value = inputData.pct
      screen.getByTestId("commentary").value = inputData.commentary
      testNewbill.fileName = inputData.fileName
      testNewbill.fileUrl = inputData.fileUrl
      testNewbill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e)=>{ testNewbill.handleSubmit(e)})
      submitBtn.addEventListener("submit", handleSubmit)
      fireEvent.submit(submitBtn)
      expect(handleSubmit).toHaveBeenCalled()
      expect(testNewbill.updateBill).toHaveBeenCalled()
    })
  })
})