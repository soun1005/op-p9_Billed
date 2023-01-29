/**
 * @jest-environment jsdom
 */
import mockStore from "../__mocks__/store"
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import userEvent from '@testing-library/user-event'
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"

jest.mock("../app/store", () => mockStore)

// state, style of bill page
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      const windowIconHighlighted = windowIcon.classList.contains('active-icon')
      expect(windowIconHighlighted).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a > b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })  
  })
  // events -> click eye icon / add new bill button
  describe("When I click on the new bill button", () => {
    test("Then the page to add new bill should open", ()=> {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const testBills = new Bills({document, onNavigate, localStorage: window.localStorage, store: null})
      const newBillBtn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(testBills.handleClickNewBill)
      newBillBtn.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillBtn)
      const newBillPageTitle = screen.getByTestId('content-title')

      expect(handleClickNewBill).toHaveBeenCalled()
      expect(newBillPageTitle.textContent).toMatch('Envoyer une note de frais')
    })
  })

  describe("When I click on the eye icon", () => {
    test("Then a modal should open", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const testBills = new Bills({document, onNavigate, localStorage: window.localStorage, store: null})
      // mock bootstrap function
      $.fn.modal = jest.fn()
      // const handleClickIconEye = jest.fn(testBills.handleClickIconEye)
      const handleClickIconEye = jest.fn(() => { testBills.handleClickIconEye })
      const eye = screen.getByTestId('icon-eye')
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
      // when eyeIcon is clicked, modalWindow display should be block
    })
  })
})

// test d'intégration GET Bills

describe("Given I am a user connected as Employee", () => {
  describe("When I am on bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const billPage = await screen.getByText("Mes notes de frais")
      expect(billPage).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fails with 404 message error", async () => {
      // codes
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fails with 500 message error", async () => {
      // codes
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


