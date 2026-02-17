import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import dayjs from "dayjs";
import theme from "../../../../utils/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
}

const MonthDayPicker = ({
  visible,
  onClose,
  onConfirm,
  initialDate,
}: Props) => {
  const initialMonth = initialDate ? dayjs(initialDate).month() : 0;
  const initialDay = initialDate ? dayjs(initialDate).date() : 1;

  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);

  const getDaysInMonth = (monthIndex: number) => {
    return dayjs(new Date(2000, monthIndex)).daysInMonth();
  };

  useEffect(() => {
    if (initialDate) {
      setMonth(dayjs(initialDate).month());
      setDay(dayjs(initialDate).date());
    } else {
      setMonth(0);
      setDay(1);
    }
  }, [initialDate]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Date</Text>

          <View style={styles.row}>
            <Picker
              selectedValue={month}
              style={styles.picker}
              onValueChange={(value: any) => setMonth(value)}
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <Picker.Item
                  key={index}
                  label={dayjs().month(index).format("MMMM")}
                  value={index}
                />
              ))}
            </Picker>

            {/* <View style={styles.divider} /> */}

            <Picker
              selectedValue={day}
              style={styles.picker}
              onValueChange={(value: any) => setDay(value)}
            >
              {Array.from({
                length: getDaysInMonth(month),
              }).map((_, index) => (
                <Picker.Item
                  key={index + 1}
                  label={`${index + 1}`}
                  value={index + 1}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                const finalDate = new Date(2000, month, day);
                onConfirm(finalDate);
                onClose();
              }}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MonthDayPicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },

  container: {
    width: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.white,
    ...theme.font.fontBold,
  },

  row: {
    flexDirection: "row",
    backgroundColor: theme.colors.white, // white or secondary
    borderRadius: 12,
    overflow: "hidden",
  },

  picker: {
    flex: 1,
    color: theme.colors.primary,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.primary,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  cancelBtn: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },

  cancelText: {
    color: theme.colors.primary,
    ...theme.font.fontSemiBold,
    fontSize: 16,
  },

  confirmText: {
    color: theme.colors.white,
    ...theme.font.fontSemiBold,
    fontSize: 16,
  },
});
