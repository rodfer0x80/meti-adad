#!/usr/bin/env python3 

import json
import random

input_file = './database/raw/events.json'
output_file = './database/data/events.json'

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, list):
        print('Error: The loaded JSON does not appear to be a list of events.')
    else:
        updated_data = []
        for event in data:
            random_rating = random.randint(1, 20)

            event['rating'] = random_rating

            updated_data.append(event)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=4)

        print(
            f'Successfully added random ratings to {len(updated_data)} events.'
        )
        print(f'Output saved to: {output_file}')

except FileNotFoundError:
    print(f"Error: Input file '{input_file}' not found.")
except json.JSONDecodeError:
    print(
        f"Error: Failed to decode JSON from '{input_file}'. Check the file format."
    )
except Exception as e:
    print(f'An unexpected error occurred: {e}')
