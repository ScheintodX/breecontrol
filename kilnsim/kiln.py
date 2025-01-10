from datetime import datetime, timedelta
from functools import partial, wraps

import pandas as pd
import loader
import numpy as np
from scipy.optimize import minimize
#from pint import UnitRegistry, Quantity

from pandas import DataFrame
import math

K = 273

#Unit = UnitRegistry()

T_room:float = 20
#T_room:Quantity = Unit.Quantity(20, Unit.degC).to(Unit.K)

#Dt:Quantity = 30 * Unit.hour #s intervals
Dt:float = 30 #s intervals


class Kiln:

    #c:Quantity = 920 * Unit.J / Unit.kilogram / Unit.K
    #m:Quantity = 100 * Unit.kilogram
    #Q:Quantity = 18e3 * Unit.W
    c:float = 920
    m:float = 100
    Q:float = 18000

    E:float = T_room * c * m #Ws


    def tick( self, dt:float, powerfactor:float, damper:float, A1:float, A2:float, A3:float, A4:float ):

        dE:float = dt * powerfactor * self.Q
        dE -= dt * A1 * powerfactor
        dE -= dt * A2 * math.pow(self.T() - T_room, 1)
        dE -= dt * A3 * math.pow(self.T() - T_room, 2)
        dE -= dt * A4 * math.pow(self.T() - T_room, 3)

        self.E += dE

    def T( self ):
        r = self.E / self.c / self.m
        if( r > 99999999 ): return 99999999
        if( r < -99999999 ): return -99999999
        return r

    def C( self ):
        #return self.T().to( Unit.degC )
        return self.T() - K

    def setT( self, k:float ):
        self.E = k * self.c * self.m

    def setC( self, c:float ):
        self.setT( c + K )


def timerange( start:str, end:str, step:int ):

    start_time = datetime.strptime(start, "%Y-%m-%d %H:%M:%S") if type( start ) is str else start
    end_time = datetime.strptime(end, "%Y-%m-%d %H:%M:%S")
    step_delta = timedelta(seconds=step)

    current_time = start_time
    while current_time <= end_time:
        yield current_time.strftime("%Y-%m-%d %H:%M:%S")
        current_time += step_delta


def run_kiln( kiln:Kiln, ref:DataFrame, A1:float, A2:float, A3:float, A4:float):

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


def run_and_concat( ref:DataFrame, A1:float, A2:float, A3:float, A4:float):

    print( A1, A2, A3, A4 )

    kiln:Kiln = Kiln()
    kiln.setC( ref.iloc[0]['temperature'] )

    ###############################
    sim: DataFrame = run_kiln(kiln, ref, A1, A2, A3, A4)
    ###############################

    x: DataFrame = pd.concat(objs=[ref, sim], axis=1)
    print( x )

    rmsq: float = np.sqrt((( x['temperature'] - x['sim'] ) ** 2 ).mean())
    print( rmsq )

    #if rmsq < 500:
    loader.plot_data( x )

    #exit()

    return rmsq


if __name__ == "__main__":

    reference:DataFrame = loader.load_data()
    #ref = ref.loc["2024-11-24 10:00:00":"2024-11-24 13:00:00"]
    #ref = ref.loc["2024-11-24 19:00:00":"2024-11-24 23:00:00"]
    reference = reference.loc["2025-01-09 01:44:00":"2025-01-09 19:30:00"]

    #run_and_concat(reference, 0, .02, 0, 0)
    #xxx( [16.5, 0.02, 0, 0] )
    #xxx( [0, 0, 0.00002, 0] )
    #xxx( [0, 0, 0, 0.00000002] )

    #run_and_concat(reference, 0, 20, 0, 0)
    #exit()

    res = minimize(lambda x: run_and_concat(reference, x[0], x[1], x[2], x[3]),
                   [0,2.6,0,0],
                   bounds=[(None,None),(0,100),(0,1),(0,1)])

    print( res )



