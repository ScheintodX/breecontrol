import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# Load datasets
tmprset = pd.read_csv("temperature.csv")
pwerset = pd.read_csv("powerfactor.csv")
systset = pd.read_csv("system.csv")

# Parse the "time" column as datetime
tmprset["time"] = pd.to_datetime(tmprset["time"])
pwerset["time"] = pd.to_datetime(pwerset["time"])
systset["time"] = pd.to_datetime(systset["time"])

tmprset.set_index("time", inplace=True)
pwerset.set_index("time", inplace=True)
systset.set_index("time", inplace=True)

# Step 1: Resample to 1-second intervals
tmprset_resampled = tmprset.resample('1s').mean()
pwerset_resampled = pwerset.resample('1s').mean()
systset_resampled = systset.resample('1s').mean()

# Step 2: Interpolate gaps in the 1-second data
tmprset_resampled = tmprset_resampled.interpolate(method='time')
pwerset_resampled = pwerset_resampled.interpolate(method='time')
systset_resampled = systset_resampled.interpolate(method='time')

# Step 3: Downsample to 30-second intervals
tmprset_30s = tmprset_resampled.resample('30s').mean()
pwerset_30s = pwerset_resampled.resample('30s').mean()
systset_30s = systset_resampled.resample('30s').mean()

# Step 4: Combine datasets into a single DataFrame
final_dataset = tmprset_30s.join(pwerset_30s, how='outer', lsuffix='_temp', rsuffix='_power')
final_dataset = final_dataset.join(systset_30s, how='outer', rsuffix='_system')

final_dataset['Powerfactor'] = final_dataset['value_power'].where(final_dataset['value'] != 0, 0)
final_dataset['Temperature'] = final_dataset['value_temp']

# A little cleanup
final_dataset = final_dataset \
    .drop(columns=['value_power', 'value_temp', 'value'])

#final_dataset = final_dataset.loc[ :"2024-11-24 20:00:00"]
print( final_dataset )

# Create a figure and axis for the plot
fig, ax1 = plt.subplots(figsize=(12, 6))

# Plot Temperature on the first y-axis
ax1.plot(final_dataset.index, final_dataset['Temperature'], label='Temperature (°C)', color='tab:red')
ax1.set_xlabel('time')
ax1.set_ylabel('Temperature (°C)', color='tab:red')
ax1.tick_params(axis='y', labelcolor='tab:red')

# Create a second y-axis for Powerfactor
ax2 = ax1.twinx()
ax2.plot(final_dataset.index, final_dataset['Powerfactor'], label='Powerfactor', color='tab:blue')
ax2.set_ylabel('Powerfactor', color='tab:blue')
ax2.tick_params(axis='y', labelcolor='tab:blue')

# Format x-axis to show only hour:min:sec
ax1.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))


# Add grid and title
plt.title('Temperature and Powerfactor Over time')
ax1.grid(True)

# Add a legend
fig.legend(loc='upper right', bbox_to_anchor=(0.85, 0.85))

# Show the plot
plt.tight_layout()
plt.show()
