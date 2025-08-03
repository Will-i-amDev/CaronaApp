import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from "./screens/splash/splash.jsx";
import Login from "./screens/login/login.jsx";
import RegisterPassenger from "./screens/register-passenger/register-passenger.jsx";
import RegisterDriver from "./screens/register-driver/register-driver.jsx";
import Recovery from "./screens/recovery/recovery.jsx";
import Dashboard from "./screens/dashboard/dashboard.jsx";
import Passenger from "./screens/passenger/passenger.jsx";
import Ride from "./screens/ride/ride.jsx";
import RideDetail from "./screens/ride-detail/ride-detail.jsx";

const Stack = createNativeStackNavigator();

function Routes() {
    return <NavigationContainer>
        <Stack.Navigator initialRouteName="splash">

            <Stack.Screen name="splash" component={Splash}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="login" component={Login}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="register-passenger" component={RegisterPassenger}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="register-driver" component={RegisterDriver}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="recovery" component={Recovery}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="dashboard" component={Dashboard}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="passenger" component={Passenger}
                options={{
                    headerShown: false
                }} />

            <Stack.Screen name="ride" component={Ride}
                options={{
                    headerTitle: "Viagens Disponíveis",
                    headerTitleAlign: "center"
                }} />

            <Stack.Screen name="ride-detail" component={RideDetail}
                options={{
                    headerShadowVisible: false,
                    headerTitle: "",
                    headerTransparent: true
                }} />

        </Stack.Navigator>
    </NavigationContainer>
}

export default Routes;