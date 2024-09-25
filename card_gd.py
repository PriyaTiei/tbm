from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
import smtplib
from datetime import datetime, timedelta, date
import requests
from prettytable import PrettyTable
from openpyxl import Workbook
import json
from openpyxl.styles import Font

today = datetime.now()
from_date = today-timedelta(days=30)
to_date = today+timedelta(days=1)

f_y = from_date.year
f_m = from_date.month
f_d = from_date.day

t_y = to_date.year
t_m = to_date.month
t_d = to_date.day

if today.isoweekday() == 1:
    yesterday = today-timedelta(days=2)
else:
    yesterday = today-timedelta(days=1)


y_weekd = yesterday.isoweekday()
y_y = yesterday.year
y_m = yesterday.month
y_d = yesterday.day
y_weekNo = (y_d//7.1)+1
yesterday_date = f"{y_d}-{y_m}-{y_y}"
# print(yesterday_date)


weekd = datetime.now().isoweekday()
y = datetime.now().year
m = datetime.now().month
d = datetime.now().day
# to fetch week no.
weekNo = (d//7.1)+1

# generate the url address
urlForCardRaised = "http://localhost:5051/card/find/fromDate/" + \
    str(f_y)+"-"+str(f_m)+"-"+str(f_d)+"/toDate/" + \
    str(t_y)+"-"+str(t_m)+"-"+str(t_d)
urlForCardRaised_4_yesterday = "http://localhost:5051/card/find/fromDate/" + \
    str(y_y)+"-"+str(y_m)+"-"+str(y_d)+"/toDate/"+str(y)+"-"+str(m)+"-"+str(d)
print("URL-last 30 days", urlForCardRaised)
print("URL-yesterday", urlForCardRaised_4_yesterday)


# fetching the data using api
response = requests.get(urlForCardRaised)
print('response-->',response.status_code)
card = response.json()
# print(card["cards"])

response2 = requests.get(urlForCardRaised_4_yesterday)
print('response2-->',response2.status_code)
card_y = response2.json()
#####################################################################################################
wb = Workbook()

# --------------------loop to create the excel and its headers for each sheet starts-------------------------------

columns = ['A', 'B', 'C', 'D', 'E']
column_width = 12
line_name_lst = ['Summary']
for each_card in card['cards']:  # getting all the unique line name
    if each_card['line'] not in line_name_lst:
        line_name_lst.append(each_card['line'])

print('----Total line names-->',line_name_lst)

line_sheet_dct = {} # this will hold sheet obj with repective line name --> {sheetname : sheet_obj}
# Create sheets and set column widths in a loop
for i, sheet_name in enumerate(line_name_lst):
    ws = wb.create_sheet(sheet_name, i)
    line_sheet_dct[sheet_name] = ws
    for col in columns:
        ws.column_dimensions[col].width = column_width

del wb["Sheet"]
#--------------------loop to create the excel and its headers for each sheet ends----------------------------------


#--------------------Adding data to respective sheet starts----------------------------------
if card["success"] == True:
    card_list = card["cards"]  # last 30 cards
if card_y["success"] == True:  
    card_list_y = card_y["cards"]  # yesterdays cards


if card["success"] == True:
    for line_name in line_name_lst:
        print('Line name -->',line_name)
        r = 3
        card_message = "Daily TBM card raise status in GD is attached."
        for entry in card_list:
            if entry["line"] == line_name and entry["status"] != "complete":
                ws = line_sheet_dct[line_name]
                ws["A1"] = f"Summary of card raised in GD {line_name} LINE (last 30 days)"
                ws['A1'].font = Font(bold=True)
                ws["A2"] = "OP No."
                ws['A2'].font = Font(bold=True)
                ws["B2"] = "Status"
                ws['B2'].font = Font(bold=True)
                ws["C2"] = "Abnormality"
                ws['C2'].font = Font(bold=True)
                ws["D2"] = "Card"
                ws['D2'].font = Font(bold=True)
                ws["E2"] = "Pending Days"
                ws["E2"].font = Font(bold=True)
                # print(entry["line"],",",entry["status"])

                opNo = ws.cell(row=r, column=1)
                opNo.value = entry["processNo"]
                status = ws.cell(row=r, column=2)
                status.value = entry["status"]
                abnormality = ws.cell(row=r, column=3)
                abnormality.value = entry["abnormality"]
                cardType = ws.cell(row=r, column=4)
                cardType.value = entry["cardType"]
                pending_days = ws.cell(row=r, column=5)
                dateCreated = date(int(entry["createdAt"][0:4]), int(
                    entry["createdAt"][5:7]), int(entry["createdAt"][8:10]))
                pending_days.value = (today.date()-dateCreated).days
                r = r+1

    # ================================SUMMARY SHEET-Last 30 days=========================================================
    wsS = line_sheet_dct['Summary']
    wsS["A1"] = "Summary of card raised in GD (last 30 days)"
    wsS['A1'].font = Font(bold=True)
    wsS["A2"] = "LINE"
    wsS['A2'].font = Font(bold=True)
    wsS["B2"] = "TOTAL"
    wsS['B2'].font = Font(bold=True)
    wsS["C2"] = "COMPLETE"
    wsS['C2'].font = Font(bold=True)
    wsS["D2"] = "INPROGRESS"
    wsS['D2'].font = Font(bold=True)
    wsS["E2"] = "PENDING"
    wsS['E2'].font = Font(bold=True)
    summary_row_num  = 3
    for each_line in line_name_lst:
        if each_line != 'Summary':
            wsS["A"+str(summary_row_num )] = each_line
            wsS["A"+str(summary_row_num )].font = Font(bold=True)
            summary_row_num += 1

    complete = 0
    inprogress = 0
    pending = 0
    row = 3

    for each_line in  line_name_lst:
        if each_line != 'Summary':
            complete = 0
            inprogress = 0
            pending = 0
            for entry in card_list:
                if entry["line"] == each_line:
                    if entry["status"] == "complete":
                        complete = complete+1
                    if entry["status"] == "inprogress":
                        inprogress = inprogress+1
                    if entry["status"] == "pending":
                        pending = pending+1
                
            total_B = wsS.cell(row=row, column=2)
            total_B.value = complete+inprogress+pending
            complete_B = wsS.cell(row=row, column=3)
            complete_B.value = complete
            inprogress_B = wsS.cell(row=row, column=4)
            inprogress_B.value = inprogress
            pending_B = wsS.cell(row=row, column=5)
            pending_B.value = pending

            row += 1

    # ================================SUMMARY SHEET-YESTERDAY=========================================================
    if card_y["success"] == True:
        summary_row_num = summary_row_num + 5
        row = summary_row_num + 2
        wsS["A"+str(summary_row_num)] = "Summary of card raised in GD (Yesterday)"
        wsS['A'+str(summary_row_num)].font = Font(bold=True)
        wsS["A"+str(summary_row_num + 1)] = "LINE"
        wsS['A'+str(summary_row_num + 1)].font = Font(bold=True)
        wsS["B"+str(summary_row_num + 1)] = "TOTAL"
        wsS['B'+str(summary_row_num + 1)].font = Font(bold=True)
        wsS["C"+str(summary_row_num + 1)] = "COMPLETE"
        wsS['C'+str(summary_row_num + 1)].font = Font(bold=True)
        wsS["D"+str(summary_row_num + 1)] = "INPROGRESS"
        wsS['D'+str(summary_row_num + 1)].font = Font(bold=True)
        wsS["E"+str(summary_row_num + 1)] = "PENDING"
        wsS['E'+str(summary_row_num + 1)].font = Font(bold=True)

        summary_row_num = summary_row_num + 2
        for each_line in line_name_lst:
            if each_line != 'Summary':
                wsS["A"+str(summary_row_num )] = each_line
                wsS["A"+str(summary_row_num )].font = Font(bold=True)
                summary_row_num += 1

        complete = 0
        inprogress = 0
        pending = 0

        for each_line in  line_name_lst:
            if each_line != 'Summary':
                complete = 0
                inprogress = 0
                pending = 0
                for entry in card_list_y:
                    if entry["line"] == each_line:
                        if entry["status"] == "complete":
                            complete = complete+1
                        if entry["status"] == "inprogress":
                            inprogress = inprogress+1
                        if entry["status"] == "pending":
                            pending = pending+1
                    
                total_B = wsS.cell(row=row, column=2)
                total_B.value = complete+inprogress+pending
                complete_B = wsS.cell(row=row, column=3)
                complete_B.value = complete
                inprogress_B = wsS.cell(row=row, column=4)
                inprogress_B.value = inprogress
                pending_B = wsS.cell(row=row, column=5)
                pending_B.value = pending

                row += 1
    wb.save("card_status_gd.xlsx")
else:
    card_message = "No TBM card raised in last 30 days."

print('------------------------excel part ends--------------------------')
#--------------------Adding data to respective sheet ends----------------------------------

# ==============================pending card details starts===============================
# wb_new = Workbook()
# ws_pending = wb_new.create_sheet("Pending Cards", 0)

ws_pending = wb.create_sheet("Pending Cards", len(line_name_lst))


ws_pending.column_dimensions['A'].width = 12
ws_pending.column_dimensions['B'].width = 12
ws_pending.column_dimensions['C'].width = 12
ws_pending.column_dimensions['D'].width = 12
ws_pending.column_dimensions['E'].width = 12

ws_pending["A1"] = "Details For Pending Cards for more than 30 days"
ws_pending['A1'].font = Font(bold=True)
ws_pending['A2'] = "Line"
ws_pending['A2'].font = Font(bold=True)
ws_pending['B2'] = "Process No"
ws_pending['B2'].font = Font(bold=True)
ws_pending['C2'] = "CheckItem Id"
ws_pending['C2'].font = Font(bold=True)
ws_pending['D2'] = "Pending Since(entryDates)"
ws_pending['D2'].font = Font(bold=True)
ws_pending['E2'] = "Frequency"
ws_pending['E2'].font = Font(bold=True)

urlForPendingCardsGreater30days = "http://localhost:5051/reports/pendingForGreater30Days"
response_pending = requests.get(urlForPendingCardsGreater30days)
print('response_pending-->',response_pending.status_code)
penData = response_pending.json()

urlForFrequency = "http://localhost:5051/reports/tbmFrequency"
response_freq = requests.get(urlForFrequency)
freqData = response_freq.json()
print('response_frequency-->',response_freq.status_code,freqData)

pen_row = 3
if penData['success']:
    for eachCard in penData['pendingTasks']:
        line = ws_pending.cell(row=pen_row, column=1)
        line.value = eachCard['line']
        processNo = ws_pending.cell(row=pen_row, column=2)
        processNo.value = eachCard['processNo']
        checkItem = ws_pending.cell(row=pen_row, column=3)
        checkItem.value = eachCard['checkItem']
        entryDates = ws_pending.cell(row=pen_row, column=4)
        entryDates.value = eachCard['entryDates']

        if freqData['success']:
            for freqCard in freqData['frequencyTasks']:
                top = freqCard['top']
                if top['checkItem'] == eachCard['checkItem']:
                    freq = ws_pending.cell(row=pen_row, column=5)
                    if top['frequency']:
                        freq.value = top['frequency'][0]
                    else:
                        freq.value = 'NA'
        
        pen_row += 1

wb.save("card_status_gd.xlsx")

# ==============================pending card details ends===============================

# ==============================excel part finished=========================================


# ==============================mail summarry part starts===================================

today = datetime.now()
if today.isoweekday() == 1:
    yesterday = today-timedelta(days=2)
else:
    yesterday = today-timedelta(days=1)


y_weekd = yesterday.isoweekday()
y_y = yesterday.year
y_m = yesterday.month
y_d = yesterday.day
y_weekNo = (y_d//7.1)+1

weekd = datetime.now().isoweekday()
y = datetime.now().year
m = datetime.now().month
d = datetime.now().day
# to fetch week no.
weekNo = (d//7.1)+1

# generate the url address
# print("Year:",y,"Month:",m,"Day:",d,"WeekDay:",weekd,"Week No:",weekNo)
url4mcDetails = "http://localhost:5051/head/headMachineList?d=" + \
    str(y_weekd)+"&y="+str(y_y)+"&w="+str(y_weekNo)+"&m="+str(y_m)+"&pS=P"
url4dailyStatus = "http://localhost:5051/dailyStatus?entryFor=" + \
    str(y_y)+"-"+str(y_m)+"-"+str(y_d)+"&pS=P"
url4mcDetails_OM = "http://localhost:5051/head/headMachineList?d=" + \
    str(y_weekd)+"&y="+str(y_y)+"&w="+str(y_weekNo)+"&m="+str(y_m)+"&pS=S"
url4dailyStatus_OM = "http://localhost:5051/dailyStatus?entryFor=" + \
    str(y_y)+"-"+str(y_m)+"-"+str(y_d)+"&pS=S"
print(url4mcDetails)
print(url4dailyStatus)
print(url4mcDetails_OM)
print(url4dailyStatus_OM)

# fetching the data using api
response1 = requests.get(url4mcDetails)
response2 = requests.get(url4dailyStatus)
mcDetails = response1.json()
dailyStatus = response2.json()

response3 = requests.get(url4mcDetails_OM)
response4 = requests.get(url4dailyStatus_OM)
mcDetails_OM = response3.json()
dailyStatus_OM = response4.json()

# to get total number of line list
url = "http://localhost:5051/head/headMachineList"
response5 = requests.get(url)
res_data = response5.json()
if res_data['success']:
    res_data = res_data['machineData'];
    final_line_list = [x['line'] for x in res_data]
else:
    final_line_list = ["Assembly (Block Sub-assembly)", "Assembly (Head Sub-assembly)", "Assembly (MK-1)",
                       "Assembly (MK-2)", "Assembly (Piston Sub-assembly)", "Assembly (Test Bench)", "Block", "Crank", "Head"]

print('----final line list-->',final_line_list)

# ================================mail summary for maintenance===============================================================
line_list_mnt = []
tabular_fields = ["Line", "Total", "OK", "NG", "Pending"]
tabular_table = PrettyTable()
tabular_table.field_names = tabular_fields

# wsP = wb.create_sheet("PendingMain", 4)

if mcDetails['success']:
    for i in mcDetails["machineData"]:
        # m=mcData["machineData"]
        # print("from-mcData:",i["line"])
        line_name_mcData = i["line"]
        # print(i["counts"])
        nn = i["counts"]
        total_points = sum(nn.values())
        # print("Total:",sum(nn.values()))
        ok_p = 0
        ng_p = 0

        for j in dailyStatus["sortedDailyStatus"]:
            line_name_statusData = j["line"]
            if line_name_statusData == line_name_mcData:
                # ok_p=0
                # ng_p=0
                # print("from-sortedDetails:",j["line"])

                for jj in j["processes"]:
                    # print(jj["result"],"\n")
                    ok_p = ok_p + jj["result"].get("OK")
                    ng_p = ng_p + jj["result"].get("NG")
                # print(j,"\n\n")
                # print("OK:",ok_p)
                # print("NG",ng_p)
                # print("\n")
            else:
                pass
        tabular_table.add_row([line_name_mcData, total_points, ok_p, ng_p, total_points-ok_p-ng_p])
        line_list_mnt.append(line_name_mcData)
        ok_p = 0
        ng_p = 0

# total_line_list_mnt = ["Assembly (Block Sub-assembly)", "Assembly (Head Sub-assembly)", "Assembly (MK-1)",
#                        "Assembly (MK-2)", "Assembly (Piston Sub-assembly)", "Assembly (Test Bench)", "Block", "Crank", "Head"]



total_line_list_mnt = final_line_list


for line_name_mnt in total_line_list_mnt:
    if line_name_mnt not in line_list_mnt:
        tabular_table.add_row([line_name_mnt, "-", "-", "-", "-"])
# ================================mail summary for production================================================================
line_list_prod = []
tabular_fields_OM = ["Line", "Total", "OK", "NG", "Pending"]
tabular_table_OM = PrettyTable()
tabular_table_OM.field_names = tabular_fields_OM

if mcDetails_OM['success']:
    for i in mcDetails_OM["machineData"]:
        # m=mcData["machineData"]
        # print("from-mcData:",i["line"])
        line_name_mcData = i["line"]
        # print(i["counts"])
        nn = i["counts"]
        total_points = sum(nn.values())
        # print("Total:",sum(nn.values()))
        ok_p = 0
        ng_p = 0

        for j in dailyStatus_OM["sortedDailyStatus"]:
            line_name_statusData = j["line"]
            if line_name_statusData == line_name_mcData:
                # ok_p=0
                # ng_p=0
                # print("from-sortedDetails:",j["line"])

                for jj in j["processes"]:
                    # print(jj["result"],"\n")
                    ok_p = ok_p + jj["result"].get("OK")
                    ng_p = ng_p + jj["result"].get("NG")
                # print(j,"\n\n")
                # print("OK:",ok_p)
                # print("NG",ng_p)
                # print("\n")
            else:
                pass
        tabular_table_OM.add_row([line_name_mcData, total_points, ok_p, ng_p, total_points-ok_p-ng_p])
        line_list_prod.append(line_name_mcData)
        ok_p = 0
        ng_p = 0
else:
    print('------')
# total_line_list_prod = ["Assembly (Block Sub-assembly)", "Assembly (Head Sub-assembly)", "Assembly (MK-1)",
#                         "Assembly (MK-2)", "Assembly (Piston Sub-assembly)", "Assembly (Test Bench)", "Block", "Crank", "Head"]

total_line_list_prod = final_line_list

for line_name_prod in total_line_list_prod:
    if line_name_prod not in line_list_prod:
        tabular_table_OM.add_row([line_name_prod, "-", "-", "-", "-"])
# ==============================mail summarry part ends=====================================

# ==============================table for mail-start========================================
print("OM\n", tabular_table_OM)
print('-------------------------------------------------------')
print("SM\n", tabular_table)
# ==============================table for mail-end========================================


# ==============================TO SEND EMAIL==GD MNT===================================


# Connection with the server
server = smtplib.SMTP(host="smtp.office365.com", port=587)
server.starttls()
server.login("username", "pass")

# Creation of the MIMEMultipart Object
message = MIMEMultipart()
# =================================================================================================
family = [
    "subham.gupta.26@outlook.com"
]

# msg['To'] =', '.join(family)
# msg =', '.join(family)
# print(msg)
# =================================================================================================


# Setup of MIMEMultipart Object Header
message['From'] = "subham.g@dtcinfotech.com"
message['To'] = ', '.join(family)
message['Subject'] = "GD-MNT Daily TBM card status"

# Creation of a MIMEText Part
# textPart1 = MIMEText(f"Good Morning\nSUMMARY OF PREVIOUS DAY ({y_d}-{y_m}-{y_y}) TBM CHECK ACTIVITY\n\nA.PRODUCTION\n\nLine\tTotal\tOK\tNG\tPending\nBlock\t{total_block_OM}\t{ok_Block_OM}\t{ng_Block_OM}\t{total_block_OM-ok_Block_OM-ng_Block_OM}\nCrank\t{total_crank_OM}\t{ok_Crank_OM}\t{ng_Crank_OM}\t{total_crank_OM-ok_Crank_OM-ng_Crank_OM}\nHead\t{total_head_OM}\t{ok_Head_OM}\t{ng_Head_OM}\t{total_head_OM-ok_Head_OM-ng_Head_OM}\n\nB.MAINTENANCE\n\nLine\tTotal\tOK\tNG\tPending\nBlock\t{total_block}\t{ok_Block}\t{ng_Block}\t{total_block-ok_Block-ng_Block}\nCrank\t{total_crank}\t{ok_Crank}\t{ng_Crank}\t{total_crank-ok_Crank-ng_Crank}\nHead\t{total_head}\t{ok_Head}\t{ng_Head}\t{total_head-ok_Head-ng_Head}\n\nDaily TBM card raise status is attached.\nThank You\n\nMNT-MES", 'plain')
my_message = tabular_table_OM.get_html_string()
my_message2 = tabular_table.get_html_string()
html = """\
<html>
    <head>
    <style>
        table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
        }
        th, td {
            padding: 5px;
            text-align: left;    
        }    
    </style>
    </head>
<body>
<p>
Good Morning<br> 
SUMMARY OF PREVIOUS DAY <b>(%s)</b> TBM CHECK ACTIVITY<br> 
</p>
<p>    
<b>GD-MAINTENANCE</b>
    <br>
    %s
</p>
<p>
%s<br>
Thank You
</p>
<p>
MNT-MES
</p>
</body>
</html>
""" % (yesterday_date, my_message2, card_message)

textPart1 = MIMEText(html, 'html')

# Creation of a MIMEApplication Part

if card["success"] == True:
    filename = "card_status_gd.xlsx"
    filePart = MIMEApplication(open(filename, "rb").read(), Name=filename)
    filePart["Content-Disposition"] = 'attachment; filename="%s' % filename

    # Parts attachment
    message.attach(filePart)
message.attach(textPart1)

# Send Email and close connection
server.send_message(message)
server.quit()

# ==================================EMAIL PART END===============================================


# ==============================TO SEND EMAIL==GD PROD=============================================


# Connection with the server
server = smtplib.SMTP(host="smtp.office365.com", port=587)
server.starttls()
server.login("username", "pass")

# Creation of the MIMEMultipart Object
message = MIMEMultipart()
# =================================================================================================
family = [
    "subham.gupta.26@outlook.com"
]

# msg['To'] =', '.join(family)
# msg =', '.join(family)
# print(msg)
# =================================================================================================


# Setup of MIMEMultipart Object Header
message['From'] = "subham.g@dtcinfotech.com"
message['To'] = "subham.gupta.26@outlook.com"
# message['To'] = ', '.join(family)
message['Subject'] = "GD-PROD Daily TBM card status"

# Creation of a MIMEText Part
# textPart1 = MIMEText(f"Good Morning\nSUMMARY OF PREVIOUS DAY ({y_d}-{y_m}-{y_y}) TBM CHECK ACTIVITY\n\nA.PRODUCTION\n\nLine\tTotal\tOK\tNG\tPending\nBlock\t{total_block_OM}\t{ok_Block_OM}\t{ng_Block_OM}\t{total_block_OM-ok_Block_OM-ng_Block_OM}\nCrank\t{total_crank_OM}\t{ok_Crank_OM}\t{ng_Crank_OM}\t{total_crank_OM-ok_Crank_OM-ng_Crank_OM}\nHead\t{total_head_OM}\t{ok_Head_OM}\t{ng_Head_OM}\t{total_head_OM-ok_Head_OM-ng_Head_OM}\n\nB.MAINTENANCE\n\nLine\tTotal\tOK\tNG\tPending\nBlock\t{total_block}\t{ok_Block}\t{ng_Block}\t{total_block-ok_Block-ng_Block}\nCrank\t{total_crank}\t{ok_Crank}\t{ng_Crank}\t{total_crank-ok_Crank-ng_Crank}\nHead\t{total_head}\t{ok_Head}\t{ng_Head}\t{total_head-ok_Head-ng_Head}\n\nDaily TBM card raise status is attached.\nThank You\n\nMNT-MES", 'plain')
my_message = tabular_table_OM.get_html_string()
my_message2 = tabular_table.get_html_string()
html = """\
<html>
    <head>
    <style>
        table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
        }
        th, td {
            padding: 5px;
            text-align: left;    
        }    
    </style>
    </head>
<body>
<p>
Good Morning<br> 
SUMMARY OF PREVIOUS DAY <b>(%s)</b> TBM CHECK ACTIVITY<br> 
</p>
<p>    
<b>GD-PRODUCTION</b>
    <br>
    %s
</p>
<p>
%s<br>
Thank You
</p>
<p>
MNT-MES
</p>
</body>
</html>
""" % (yesterday_date, my_message, card_message)

textPart1 = MIMEText(html, 'html')

# Creation of a MIMEApplication Part

if card["success"] == True:
    filename = "card_status_gd.xlsx"
    filePart = MIMEApplication(open(filename, "rb").read(), Name=filename)
    filePart["Content-Disposition"] = 'attachment; filename="%s' % filename

    # Parts attachment
    message.attach(filePart)
message.attach(textPart1)

# Send Email and close connection
server.send_message(message)
server.quit()

# ==================================EMAIL PART END===============================================
