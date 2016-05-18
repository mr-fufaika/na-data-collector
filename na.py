#!/usr/bin/python

import csv
from q import Q
from datetime import date

field_names = ['Date']
row = {};
rs = [];

for question in Q:
	text = question.get('Question')
	column = question.get('Column')
	awaits = question.get('awaits')

	field_names += [column];

	row['Date'] = str(date.today())

	while True:
		try:
			answer = raw_input(text + (' (Y/n)\n' if awaits == 'y/n' else '\n'))
			
			if awaits == 'y/n':
				answer = False if ( answer == 'n' or answer == 'N' ) else True
			elif awaits != 'any':
				if not answer or answer not in awaits:
					raise ValueError
			
			row[column] = answer
			break
		except ValueError:
			print 'Incorect input. Expect: 1-5.'


with open('./data.csv', 'r+') as csvfile:
	writer = csv.DictWriter(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL, fieldnames=field_names)
	reader = csv.DictReader(csvfile)
	
	if not len(list(reader)):
		writer.writeheader()

	writer.writerow(row)