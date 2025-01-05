from datetime import datetime, timedelta
from functools import partial

import pandas as pd
import loader
import numpy as np
from scipy.optimize import minimize

from pandas import DataFrame
import math

K:float = 273.15
T_r:float = 20 + K

Dt:float = 30

minute = lambda x: x*60
hour = lambda x: x*minute(60)

# 1J = 1Ws


class Kiln:

    c:float = 920 #J/(kg*K)
    m:float = 100 #kg
    Q:float = 18e3 #W

    E:float = T_r * c * m #Ws


    def tick( self, dt:float, f:float, damper:int, A1:float, A2:float, A3:float, A4:float ):

        dE:float = dt * f * self.Q
        dE -= dt * A1 * f
        #dE -= dt * A1 * (damper/4) * math.pow( self.T() - T_r, 1 )
        dE -= dt * A2 * math.pow( self.T() - T_r, 1 )
        dE -= dt * A3 * math.pow( self.T() - T_r, 2 )
        dE -= dt * A4 * math.pow( self.T() - T_r, 3 )

        self.E += dE

    def T( self ):
        r = self.E / self.c / self.m
        if( r > 99999999 ): return 99999999
        if( r < -99999999 ): return -99999999
        return r

    def C( self ):
        return self.T() - K

    def setT( self, k ):
        self.E = k * self.c * self.m

    def setC( self, c ):
        self.setT( c+K )


def timerange( start:str, end:str, step:int ):

    start_time = datetime.strptime(start, "%Y-%m-%d %H:%M:%S") if type( start ) is str else start
    end_time = datetime.strptime(end, "%Y-%m-%d %H:%M:%S")
    step_delta = timedelta(seconds=step)

    current_time = start_time
    while current_time <= end_time:
        yield current_time.strftime("%Y-%m-%d %H:%M:%S")
        current_time += step_delta


def run_kiln( kiln:Kiln, ref, A1:float, A2:float, A3:float, A4:float):

    data:dict = []

    for time, row in ref.iterrows():

        powerfactor = row['powerfactor']
        damper = row['damper']
        T = row['temperature']

        kiln.tick( Dt, powerfactor, damper, A1, A2, A3, A4 )
        data.append( {
                "time": time,
                "sim": kiln.C(),
                "error": math.fabs( T - kiln.C())
        } )

    df:DataFrame = DataFrame( data )
    df.set_index( "time", inplace=True )

    return df


def warp( ref:DataFrame, A1:float, A2:float, A3:float, A4:float ):

    print( A1, A2, A3, A4 )

    kiln:Kiln = Kiln()
    kiln.setC( ref.iloc[0]['temperature'] )

    sim: DataFrame = run_kiln(kiln, ref, A1, A2, A3, A4)
    x: DataFrame = pd.concat(objs=[ref, sim], axis=1)

    rmsq: float = np.sqrt(((x['temperature'] - x['sim']) ** 2).mean())
    print( rmsq )

    #if( rmsq < 200 ):
    loader.plot_data( x )

    return rmsq


if __name__ == "__main__":

    ref:DataFrame = loader.load_data()
    #ref = ref.loc["2024-11-24 10:00:00":"2024-11-24 13:00:00"]
    ref = ref.loc["2024-11-24 19:00:00":"2024-11-24 23:00:00"]
    #print( ref )
    #print(f"Rows: {ref.shape[0]}, Columns: {ref.shape[1]}")
    #exit()

    xxx = lambda x: warp( ref, x[0], x[1], x[2], x[3] )

    #xxx( [0, .02, 0, 0] )
    #xxx( [16.5, 0.02, 0, 0] )
    #xxx( [0, 0, 0.00002, 0] )
    #xxx( [0, 0, 0, 0.00000002] )

    warp( ref, 0, 20, 0, 0 )
    #exit()

    print( minimize( xxx, [0,20,0,0], bounds=[(None,None),(0,100),(0,1),(0,1)] ) )



