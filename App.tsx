import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";
import AntDesign from "react-native-vector-icons/AntDesign";
import Fontisto from "react-native-vector-icons/Fontisto";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "./src/constants/Colors";
import { AmountFormatter, convertTime } from "./src/utils/util";

const JetSetGoApp = () => {
  const [filtersList, setFiltersList] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string[]>([]);
  const [sortedByPriceAsc, setSortedByPriceAsc] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [flights, setFlights] = useState<IFlight[]>([]);
  const [filteredData, setFilteredData] = useState<IFlight[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getData();
    setSelectedFilter([]);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    filterByAirline();
  }, [selectedFilter]);

  const getData = async () => {
    try {
      const response = await axios.get<IFlight[]>(
        "https://api.npoint.io/378e02e8e732bb1ac55b"
      );
      setFlights(response.data);
      setFilteredData(response.data);
      getFiltersList(response.data);
    } catch (error) {
      console.error("Error fetching flights:", error);
    }
  };

  const getFiltersList = (data: IFlight[]) => {
    const airlineNames = [...new Set(data.map((flight) => flight.airline))];
    setFiltersList(airlineNames);
  };

  const sortByPrice = () => {
    if (sortedByPriceAsc) {
      const sortedFlights = [...filteredData].sort((a, b) => b.price - a.price);

      setFilteredData(sortedFlights);
      setSortedByPriceAsc(false);
    } else {
      const sortedFlights = [...filteredData].sort((a, b) => a.price - b.price);

      setFilteredData(sortedFlights);
      setSortedByPriceAsc(true);
    }
  };

  const filterByAirline = () => {
    if (selectedFilter.length === 0) {
      setFilteredData(flights);
    } else {
      let filterData = flights.map((flight) => {
        if (selectedFilter.includes(flight.airline)) {
          return flight;
        }
      });

      let updatedData = filterData.filter((f) => f != undefined) as IFlight[];
      setFilteredData(updatedData);
    }
  };

  const onChipPress = (i: string) => {
    setSelectedFilter((prev) => {
      const updatedState = new Set(prev);
      if (updatedState.has(i)) {
        updatedState.delete(i);
      } else {
        updatedState.add(i);
      }
      return Array.from(updatedState);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Jet Set Go</Text>
        <Ionicons name="airplane-sharp" size={20} />
      </View>
      <View style={styles.featureContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.filterButton}
        >
          <AntDesign name="filter" size={18} />
          <Text>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={sortByPrice} style={styles.filterButton}>
          <Ionicons name={"swap-vertical-sharp"} size={18} />
          <Text>Price</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.flightListContainer}>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={filteredData}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={{ height: 70 }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Fontisto name="plane" size={18} />
                    <Text style={styles.airline}>{item.airline}</Text>
                  </View>

                  <View>
                    <Text style={styles.price}>
                      {AmountFormatter(item.price)}
                    </Text>
                    <Text style={styles.label}>per person</Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.column}>
                    <Text style={styles.label}>{item.origin}</Text>
                    <Text style={styles.value}>
                      {convertTime(item?.departureTime)}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>non-stop</Text>
                    <Text style={styles.value}>
                      {item.duration
                        .replace("hours", "H")
                        .replace("minutes", "M")}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>{item.destination}</Text>
                    <Text style={styles.value}>
                      {convertTime(item.arrivalTime)}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>Seats</Text>
                    <Text style={styles.value}>{item.seatsAvailable}</Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
          keyExtractor={(item: IFlight) => item?.id?.toString()}
        />
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  Filters
                </Text>
              </View>
              <View
                style={{
                  flex: 2,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {filtersList.map((i, index) => {
                  return (
                    <Chip
                      key={index.toString()}
                      selectedColor={
                        selectedFilter.includes(i) ? Colors.white : Colors.black
                      }
                      style={{
                        backgroundColor: selectedFilter.includes(i)
                          ? Colors.chip
                          : Colors.white,
                        margin: 5,
                        width: "40%",
                      }}
                      mode={selectedFilter.includes(i) ? "flat" : "outlined"}
                      selected={selectedFilter.includes(i)}
                      onPress={() => onChipPress(i)}
                    >
                      {i}
                    </Chip>
                  );
                })}
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Button
                  title="Apply"
                  onPress={() => {
                    setModalVisible(false);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JetSetGoApp;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "ghostwhite" },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.4,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    fontStyle: "italic",
    marginHorizontal: 5,
    color: Colors.black,
  },
  flightListContainer: {
    flex: 9,
  },
  featureContainer: {
    flex: 0.6,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  card: {
    backgroundColor: Colors.white,
    padding: "5%",
    margin: "3%",
    borderBottomColor: Colors.green,
    borderBottomWidth: 5,
  },
  airline: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 5,
    fontStyle: "italic",
    color: Colors.black,
  },
  price: {
    fontWeight: "600",
    color: Colors.green,
    textAlign: "right",
  },
  column: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: Colors.grey2,
  },
  value: {
    fontWeight: "500",
    fontSize: 14,
    color: Colors.black,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 35,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "30%",
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.black,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    width: "20%",
    justifyContent: "space-evenly",
    color: Colors.black,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
