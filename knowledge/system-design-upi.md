### Traditional Approach for Payments in India UPI
Traditional System for Payments in India work on the basis of banks. Users must have a bank account to make payments. They can have their accounts in any of the banks like ICICI, HDFC, SBI, HSBC, etc. 

![Traditional Payment Approach](/public/uploads/traditional_approach.png)

All these banks are regulated by RBI which is the Reserve Bank of India

Each user has the following unique details in their bank, irrespective of the bank that they have their account in:
	- Account Number
	- Bank Name
	- Branch Code
	- IFSC Code
Say, me as a user want to make a payment to Anil. So, to make the transaction, i will need the above details of Anil. Here, I will need the Account Details of Anil to make the transaction complete, without that there will not be any transaction done.
Now, to make the payment, there are different services that are used. 
	- For Small transaction like 1000, 2000, etc we use IMPS which is Immediate Payment Service
	- For Medium Transaction like 50,000 , 1,00,000 etc we use NEFT which is National Electronic Funds Transfer. Here the catch is that it will take hours to get reflected into the receivers account. For this , people usually save up a screenshot of their transaction stating that user 1 has already payed, and it will take some hours for the amount to get reflected on user 2's bank.
	- For High Transaction like 5,00,000 , 20,00,000 etc RTGS which is Realtime-Gross-Settlement
This is the traditional approach on the payment transfer.
***How UPI Revolutionized the Way Payment Works ?
First of all UPI stands for Unified Payment Interface. It is an instant real-time payment system developed by NPCI which is National Payments Corporation of India. 
The way UPI is changing the way things work is by saying 'Ok, we don't want to go through all the traditional of money transfer, we want to change it and make it very simple '. This is how it works:
NPCI acts as the Payment Infrastructure. 
The APIs provided by NPCI are not publicly available, hence not everyone can communicate with NPCI network.
NPCI has a list of trusted banks with which it communicates. It includes HDFC, ICICI, SBI, etc. Meaning, only these banks can communicate with the NPCI's API. 
 Now say, user wants to make a transaction, he or she cannot directly communicate with the api of NPCI. So, for that we have PSP (Payment Service Provider). This is basically a third party entity that facilitates electronic payment transactions for merchants. Some of the Customer PSPs are GooglePay, PhonePay, SuperMoney etc. 
Now here what we do is, we have a QR Code . We scan it to make the payments. We need an address to make the payments. QR Code contains the VPA of that user. VPA stands for Virutal Payment Address. It works like username@handle. 
Now say i want to make the payment from aditya@hdfc to anil@icici. I cannot directly go to NPCI as it only communicates with the trusted banks. So what happens is the PSP calls the banks with which it has its tie up. Say i am using GooglePay which has the tieup to HDFC Bank, it will communicate with the HDFC Bank for the transaction.
While making the payment, it would create an intent which would be like:
	from:aditya@hdfc
	to:anil@icici
	amount: 5000
Now this payment request goes to HDFC Bank, which then sends it to NPCI asking for the payment from aditya to anil of Rs 5000. 
NPCI then asks if the amount is available in the sender's bank, that is when we get a screen on putting the PIN for the payment.  Once the amount is debited, it then sends a notification to user that the amount has been debited. NPCI now sends a request to the receiver's bank asking to credit the amount. If the server is busy, it will fail to response. That is when we get a notification that the receiver's server is busy. If it is not busy, the amount will be credited to the user2 and they will receive a message of credit.

![UPI Payment Process](/public/uploads/upi_payment_process.png)

NPCI has just made this possible using the from and to VPA(Virtual Payment Address).
<iframe title="System Design of UPI Payments" src="https://www.youtube.com/embed/fqySz1Me2pI?si=rj-ODs9rpW6ZPBGt" height="113" width="200" allowfullscreen="" allow="fullscreen" style="aspect-ratio: 1.76991 / 1; width: 100%; height: 100%;"></iframe>
https://razorpay.com/blog/what-is-upi-and-how-it-works/
https://razorpay.com/blog/what-is-a-payment-service-provider/
https://bytebytego.com/guides/unified-payments-interface-upi-in-india