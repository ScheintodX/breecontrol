from scipy.optimize import minimize
from scipy.integrate import solve_ivp
from datetime import timedelta, datetime
from numpy.typing import ArrayLike
from matplotlib import pyplot as plt
import pandas as pd
import numpy as np

temperature_log_file = "temperature.csv"
powerfactor_log_file = "powerfactor.csv"
system_log_file = "system.csv"

def load_data(path: str) -> pd.DataFrame:
    raw_data = pd.read_csv(path)
    print(raw_data)

    raw_data["time"] = pd.to_datetime(raw_data["time"])
    raw_data = raw_data.set_index("time")
    return raw_data

def load_measurement_data() -> pd.DataFrame:
    temperature_data = load_data(temperature_log_file)
    powerfactor_data = load_data(powerfactor_log_file)
    system_data = load_data(system_log_file)


    data = temperature_data.join(powerfactor_data)
    data = data.join(system_data)
    data.sort_index(inplace=True, axis=0)
    data = data.interpolate(method="nearest")

    start_time = data.index[0]

    time_second_series = pd.Series()
    for idx, _ in data.iterrows():
        time_second_series[idx] = (idx - start_time).seconds

    data["time_seconds"] = time_second_series

    return data

def model(t: float, y: ArrayLike, measurement: pd.DataFrame, loss_factor: float, power_constant: float, start_time: datetime) -> ArrayLike:
    selected_measurement_row = measurement.asof(start_time + timedelta(seconds=t), subset="time_seconds")
    power_factor = selected_measurement_row["powerfactor.mean"]
    system = selected_measurement_row["system.mean"]

    if system < 0.5:
        power_factor = 0

    input_power = power_factor * power_constant
    constant_loss = (y[0] - 25.0) * loss_factor

    xnew = input_power - constant_loss

    return [xnew]

def model_temperatur(dt: float, actual_temperature: float, power: float, loss_factor: float) -> float:
    actual_temperature += dt * (power - actual_temperature * loss_factor)
    return actual_temperature

def simulate(measurement_data: pd.DataFrame, loss_factor: float, power_constant: float) -> pd.DataFrame:
    """## Simulate over the same timespan as the measurement. Initial conditions are extracted from the measurement data

    ### Args:
        - `measurement_data (pd.DataFrame)`: Measurement data
        - `loss_factor (float)`: Loss factor
        - `power_constant (float)`: Power constant
    ### Returns:
        - `pd.DataFrame`: _description_
    """
    initial_temp = measurement_data.iloc[0]["temp.mean"]
    start_time = measurement_data.index[0]
    end_time = measurement_data.index[-1]

    duration_seconds = (end_time-start_time).seconds

    y0 = np.asarray([initial_temp])

    solution = solve_ivp(model, [0, duration_seconds], y0, args=[measurement_data, loss_factor, power_constant, start_time], dense_output=True, method="LSODA")

    result = pd.DataFrame()
    result.index = measurement_data.index

    result["sim"] = [solution["sol"](t)[0] for t in measurement_data.time_seconds]
    return result


def error_function(parameters: ArrayLike, measurement_data: pd.DataFrame) -> float:
    loss_factor = parameters[0]
    power_constant = parameters[1]

    result = simulate(measurement_data, loss_factor, power_constant)

    #Calculate error between simulation and measurements. For a positive and smooth errorfunction, square errors
    error = ((result["sim"] - measurement_data["temp.mean"])**2).sum()
    return error


def main():
    measurement_data = load_measurement_data()

    # simulate response of model
    x0 = [
        0.02, # loss_factor
        1000, # power constant
    ]

    result = simulate(measurement_data, 0.0004, 0.3)
    result["temp.mean"] = measurement_data["temp.mean"]
    result[["sim", "temp.mean"]].plot()
    plt.show()

    ## Parameter optimization
    #minresult= minimize(error_function, x0, args=measurement_data)
    #print(minresult)


if __name__ == "__main__":
    main()
