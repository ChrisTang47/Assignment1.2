/* 輸入 Type */
export type BillInput = {
  date: string
  location: string
  tipPercentage: number
  items: BillItem[]
}

type BillItem = SharedBillItem | PersonalBillItem

type CommonBillItem = {
  price: number
  name: string
}

type SharedBillItem = CommonBillItem & {
  isShared: true
}

type PersonalBillItem = CommonBillItem & {
  isShared: false
  person: string
}

/* 輸出 Type */
export type BillOutput = {
  date: string
  location: string
  subTotal: number
  tip: number
  totalAmount: number
  items: PersonItem[]
}

type PersonItem = {
  name: string
  amount: number
}

/* 核心函數 */
export function splitBill(input: BillInput): BillOutput {
  let date = formatDate(input.date)
  let location = input.location
  let subTotal = calculateSubTotal(input.items)
  let tip = calculateTip(subTotal, input.tipPercentage)
  let totalAmount = subTotal + tip
  let items = calculateItems(input.items, input.tipPercentage)
  adjustAmount(totalAmount, items)
  return {
    date,
    location,
    subTotal,
    tip,
    totalAmount,
    items,
  }
}

export function formatDate(date: string): string {
  // input format: YYYY-MM-DD, e.g. "2024-03-21"
  // output format: YYYY年M月D日, e.g. "2024年3月21日"
  const [year, month, day] = date.split("-")
  const monthNum = parseInt(month, 10)
  const dayNum = parseInt(day, 10)
  
  // 組合成中文格式
  return `${year}年${monthNum}月${dayNum}日`
}

function calculateSubTotal(items: BillItem[]): number {
  // sum up all the price of the items
  let total = 0
  for (const item of items) {
    total += item.price
  }
  return total
}

export function calculateTip(subTotal: number, tipPercentage: number): number {
  // output round to closest 10 cents, e.g. 12.34 -> 12.3
  
  // 計算小費金額：小計 * 小費百分比 / 100
  const tipAmount = subTotal * tipPercentage / 100
  
  // 四捨五入到最接近的角（0.1元）
  return Math.round(tipAmount * 10) / 10
}

function scanPersons(items: BillItem[]): string[] {
  // scan the persons in the items
  const persons: string[] = []
  
  for (const item of items) {
    // 只處理個人項目（非共享項目）
    if (!item.isShared) {
      // TypeScript 類型守衛：當 isShared 為 false 時，item 一定有 person 屬性
      const personalItem = item as PersonalBillItem
      
      // 檢查這個人是否已經在名單中，避免重複
      if (!persons.includes(personalItem.person)) {
        persons.push(personalItem.person)
      }
    }
  }
  
  return persons
}

function calculateItems(
  items: BillItem[],
  tipPercentage: number,
): PersonItem[] {
  let names = scanPersons(items)
  let persons = names.length
  return names.map(name => ({
    name,
    amount: calculatePersonAmount({
      items,
      tipPercentage,
      name,
      persons,
    }),
  }))
}

function calculatePersonAmount(input: {
  items: BillItem[]
  tipPercentage: number
  name: string
  persons: number
}): number {
  // for shared items, split the price evenly
  // for personal items, do not split the price
  // return the amount for the person
  
  let personSubTotal = 0
  
  for (const item of input.items) {
    if (item.isShared) {
      // 共享項目：價格平分給所有人
      personSubTotal += item.price / input.persons
    } else {
      // 個人項目：只有指定的人付費
      const personalItem = item as PersonalBillItem
      if (personalItem.person === input.name) {
        personSubTotal += item.price
      }
    }
  }
  
  // 計算這個人的小費（基於他的小計）
  const personTip = personSubTotal * input.tipPercentage / 100
  
  // 回傳總金額（小計 + 小費），四捨五入到 0.1 元
  return Math.round((personSubTotal + personTip) * 10) / 10
}

function adjustAmount(totalAmount: number, items: PersonItem[]): void {
  // adjust the personal amount to match the total amount
  
  // 計算當前所有人金額的總和
  const currentTotal = items.reduce((sum, item) => sum + item.amount, 0)
  
  // 計算誤差（四捨五入到0.1元避免浮點數精度問題）
  const difference = Math.round((totalAmount - currentTotal) * 10) / 10
  
  // 如果沒有誤差，不需要調整
  if (difference === 0) {
    return
  }
  
  // 找到第一個人進行調整（通常是金額最高的人）
  // 這裡我們調整第一個人的金額
  if (items.length > 0) {
    items[0].amount = Math.round((items[0].amount + difference) * 10) / 10
  }
}
