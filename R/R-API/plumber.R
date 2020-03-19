library(plumber)
library(RMySQL)
library(DBI)
library(pool)
library(jsonlite)
library(bit64)
library(gmp)
library(bitops)
library(rjson)
library(stringr)
library(stringi)

#* @apiTitle Car API

db_user <- 'root'
db_password <- 'king19930906'
db_name <- '2-20-9-0-101-9'
db_table <- 'dc'
db_host <- '127.0.0.1'
db_port <- 3306

#* @filter cors
cors <- function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  plumber::forward()
}

#* Get FVIS from Database
#* @param from -> start time recored to capture
#* @param to -> end time recored to capture
#* @param zone -> zone number
#* @param area -> area number
#* @param camera -> camera number
#* @get /fvis
fvis <-function(from, to, zone, area, camera){
  # dcpref value fields
  db_node_name = db_name
  op_val = 22
  ser_val = 1
  
  options(scipen=999)
  data_handler <- dbConnect(MySQL(), user=db_user, password=db_password, dbname=db_name, host=db_host)
  i_zone = as.numeric(zone)
  i_area = as.numeric(area)
  i_camera = as.numeric(camera)
  i_from = as.numeric(from)
  i_to = as.numeric(to)
  
  i_pad1 = 0
  i_pad2 = 0
  
  i_cab32 = i_zone * (2 ^ 26) + i_area * (2 ^ 20) + i_pad1 * (2 ^ 12) + i_camera * (2 ^ 6) + i_pad2
  
  res_query <- dbGetQuery(data_handler, sprintf("select * from dc where (op16 = 12 AND cab32 = %d AND tick32 >= %d AND tick32 <= %d ) order by tick32 asc", i_cab32, i_from, i_to))
  return_json_data = res_query
  
  cab32_val = gsub(' ', '', paste(paste(paste(paste(paste(paste(paste(paste(toString(i_zone), '-'), toString(i_area)), '-'), '0'), '-'), toString(i_camera)), '-'), '0'))
  val_cab64s = as.bigz(as.character('0'))
  
  if (lengths(return_json_data['cab64']) > 1) {
    tmp_cab64s_list = return_json_data['cab64']$cab64
    tmp_cab64s = tmp_cab64s_list[[1]]
    val_cab64s = as.bigz(as.character(tmp_cab64s))
  } else {
    tmp_cab64s = return_json_data['cab64']
    val_cab64s = as.bigz(as.character(tmp_cab64s))
  }
  
  val1 = val_cab64s %/% as.bigz(2^56)
  val2 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1))) %/% as.bigz(2^48)
  val3 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2))) %/% as.bigz(2^36)
  val4 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2)) - (as.bigz(2^36) %*% as.bigz(val3))) %/% as.bigz(2^24)
  val5 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2)) - (as.bigz(2^36) %*% as.bigz(val3)) - (as.bigz(2^24) %*% as.bigz(val4))) %/% as.bigz(2^16)
  val6 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2)) - (as.bigz(2^36) %*% as.bigz(val3)) - (as.bigz(2^24) %*% as.bigz(val4)) - (as.bigz(2^16) %*% as.bigz(val5)))
  
  cab64_val = gsub(' ', '', paste(paste(paste(paste(paste(paste(paste(paste(paste(paste(toString(val1), '-'), toString(val2)), '-'), toString(val3)), '-'), toString(val4)), '-'), toString(val5)), '-'), toString(val6)))
  
  list_op16 = return_json_data['op16']$op16
  list_cla16 = return_json_data['cla16']$cla16
  list_cab64s = cab64_val
  list_cab32s = cab32_val
  list_id64 = return_json_data['id64']$id64
  list_id32 = return_json_data['id32']$id32
  list_dcv = return_json_data['jstr60k']$jstr60k
  list_tick32 = return_json_data['tick32']$tick32
  list_etick32 = return_json_data['etick32']$etick32
  
  time_array_length = lengths(return_json_data['tick32'])
  time_start = i_from
  
  json_dck_dcv = ''
  json_all_dcpref = ''
  json_result = ''
  calc_count = 1
  pack_count = 1
  
  while (calc_count < (time_array_length + 1)) {
    if (list_tick32[[calc_count]] < (time_start + 29 * pack_count)) {
      dck_dcv_step_json = sprintf('{"dck": {"op16": %d, "cla": %d, "cab64s": "%s", "cab32s": "%s", "id64": %s, "id32": %d}, "dcv": %s},', 12, as.numeric(list_cla16[[calc_count]]), list_cab64s, list_cab32s, as.bigz(list_id64[[calc_count]]), list_id32[[calc_count]], list_dcv[[calc_count]])
      json_dck_dcv = paste(json_dck_dcv, dck_dcv_step_json)
      if (calc_count == time_array_length) {
        dcpref_step_json = sprintf('{"dcpref": {"cab64s": "%s", "op": %d, "ser": %d}, "items":[%s]},', db_node_name, as.numeric(op_val), as.numeric(ser_val), json_dck_dcv)
        json_dck_dcv = ''
        json_all_dcpref = paste(json_all_dcpref, dcpref_step_json)
      }
      calc_count = calc_count + 1
    } else {
      dcpref_step_json = sprintf('{"dcpref": {"cab64s": "%s", "op": %d, "ser": %d}, "items":[%s]},', db_node_name, as.numeric(op_val), as.numeric(ser_val), json_dck_dcv)
      print(dcpref_step_json)
      json_dck_dcv = ''
      pack_count = pack_count + 1
      json_all_dcpref = paste(json_all_dcpref, dcpref_step_json)
    }
  }
  
  
  dbDisconnect(data_handler)
  
  str_json = gsub("\\\\", "", jsonlite::toJSON(json_all_dcpref))
  str_prior_parse = sub('^[^\\{]*\\{', '[{', str_json)
  str_after_parse = gsub("\"]", "]", str_prior_parse)
  json_result = gsub("}\\,]", "}]", str_after_parse)
  
  base64_enc_str = base64_enc(json_result)
  return(base64_enc_str)
}

#* Get EMeta Camera from Database
#* @param zone -> zone number
#* @param area -> area number
#* @param camera -> camera number
#* @get /cmeta
cmeta <- function(zone, area, camera){
  # dcpref value fields
  db_node_name = db_name
  op_val = 22
  ser_val = 1
  
  options(scipen=999)
  data_handler <- dbConnect(MySQL(), user=db_user, password=db_password, dbname=db_name, host=db_host)
  i_zone = as.numeric(zone)
  i_area = as.numeric(area)
  i_camera = as.numeric(camera)
  
  i_pad1 = 0
  i_pad2 = 0
  
  i_cab32 = i_zone * (2 ^ 26) + i_area * (2 ^ 20) + i_pad1 * (2 ^ 12) + i_camera * (2 ^ 6) + i_pad2
  
  res_query <- dbGetQuery(data_handler, sprintf("select * from dc where (op16 = 9 AND cab32 = %d )", i_cab32))
  return_json_data = res_query
  
  #items: dck/dcv value fields
  cab32_val = gsub(' ', '', paste(paste(paste(paste(paste(paste(paste(paste(toString(i_zone), '-'), toString(i_area)), '-'), '0'), '-'), toString(i_camera)), '-'), '0'))
  op16_list = return_json_data['op16']$op16
  op16_val_1 = op16_list[[1]]
  op16_val_2 = op16_list[[2]]
  cla16_list = return_json_data['cla16']$cla16
  cla16_val_1 = cla16_list[[1]]
  cla16_val_2 = cla16_list[[2]]
  clb16_list = return_json_data['clb16']$clb16
  clb16_val_1 = clb16_list[[1]]
  clb16_val_2 = clb16_list[[2]]
  
  tmp_cab64s_list = return_json_data['cab64']$cab64
  tmp_cab64s = tmp_cab64s_list[[1]]
  val_cab64s = as.bigz(as.character(tmp_cab64s))
  
  val1 = val_cab64s %/% as.bigz(2^56)
  val2 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1))) %/% as.bigz(2^48)
  val3 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2))) %/% as.bigz(2^36)
  val4 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2)) - (as.bigz(2^36) %*% as.bigz(val3))) %/% as.bigz(2^24)
  val5 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2)) - (as.bigz(2^36) %*% as.bigz(val3)) - (as.bigz(2^24) %*% as.bigz(val4))) %/% as.bigz(2^16)
  val6 = (val_cab64s - (as.bigz(2^56) %*% as.bigz(val1)) - (as.bigz(2^48) %*% as.bigz(val2)) - (as.bigz(2^36) %*% as.bigz(val3)) - (as.bigz(2^24) %*% as.bigz(val4)) - (as.bigz(2^16) %*% as.bigz(val5)))
  
  cab64_val = gsub(' ', '', paste(paste(paste(paste(paste(paste(paste(paste(paste(paste(toString(val1), '-'), toString(val2)), '-'), toString(val3)), '-'), toString(val4)), '-'), toString(val5)), '-'), toString(val6)))
  
  dcv_payload_list = return_json_data['jstr60k']$jstr60k
  dcv_payload_1 = dcv_payload_list[[1]]
  dcv_payload_2 = dcv_payload_list[[2]]
  
  result_json = sprintf('{"dcpref": {"cab64s": "%s", "op": %d, "ser": %d}, "items":[{"dck": {"op16": %d, "cla": %d, "clb": %d, "cab64s": "%s", "cab32s": "%s"}, "dcv": %s}, {"dck" : {"op16": %d, "cla": %d, "clb": %d, "cab64s": "%s", "cab32s": "%s"}, "dcv":%s}]}',
                        db_node_name,
                        as.numeric(op_val),
                        as.numeric(ser_val),
                        as.numeric(op16_val_1),
                        as.numeric(cla16_val_1),
                        as.numeric(clb16_val_1),
                        cab64_val,
                        cab32_val, 
                        dcv_payload_1,
                        as.numeric(op16_val_2),
                        as.numeric(cla16_val_2),
                        as.numeric(clb16_val_2),
                        cab64_val,
                        cab32_val, 
                        dcv_payload_2
  )
  dbDisconnect(data_handler)
  str_json = gsub("\\\\", "", jsonlite::toJSON(result_json))
  str_prior_parse = sub('^[^\\{]*\\{', '{', str_json)
  str_after_parse = gsub("\"]", "", str_prior_parse)
  base64_enc_str = base64_enc(str_after_parse)
  return(base64_enc_str)
}


######################################################################################################################
db_cloud_user <- 'star'
db_cloud_password <- 'skwgkftys123456789'
db_cloud_name <- 'car'
db_cloud_table <- 'tbl_dc'
db_cloud_host <- 'mytestdatabase.caivfjwibxk7.us-east-1.rds.amazonaws.com'
db_cloud_port <- 3211

#* Get Camera from Database
#* @get /camera
camera <- function() {
  options(scipen=999)
  data_handler <- dbConnect(MySQL(), user=db_cloud_user, password=db_cloud_password, dbname=db_cloud_name, host=db_cloud_host)
  res_query <- dbGetQuery(data_handler, "select cab32, jstr60k from dc where (op16 = 9 AND clb16 = 1 )")
  dbDisconnect(data_handler)
  
  array_length = lengths(res_query['cab32'])
  calc_count = 1
  
  result_json = ''
  step_json = ''
  
  while(calc_count < array_length + 1) {
    val_32 = as.bigz(as.character(res_query['cab32']$cab32[[calc_count]]))
    
    val1 = val_32 %/% as.bigz(2^26)
    val2 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1))) %/% as.bigz(2^20)
    val3 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2))) %/% as.bigz(2^12)
    val4 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2)) - (as.bigz(2^12) %*% as.bigz(val3))) %/% as.bigz(2^6)
    val5 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2)) - (as.bigz(2^12) %*% as.bigz(val3)) - (as.bigz(2^6) %*% as.bigz(val4)))
    
    val_jstr = res_query['jstr60k']$jstr60k[[calc_count]]
    
    step_1 = stri_split_fixed(toString(val_jstr), "geo", simplify = T)[, 2]
    step_2 = stri_split_fixed(toString(step_1), '[', simplify = T)[, 2]
    step_3 = gsub("]", "", step_2)
    lat = str_split(step_3, ",")[[1]][1]
    lon = str_split(step_3, ",")[[1]][2]
    
    if (calc_count != array_length) {
      step_json = sprintf('{"zone": %d, "area": %d, "camera": %d, "lat": %s, "lon": %s},', as.numeric(val1)/2, as.numeric(val2)/2, as.numeric(val4)/2, lat, lon)
      result_json = paste(result_json, step_json)
    } else {
      step_json = sprintf('{"zone": %d, "area": %d, "camera": %d, "lat": %s, "lon": %s}', as.numeric(val1)/2, as.numeric(val2)/2, as.numeric(val4)/2, lat, lon)
      result_json = paste(result_json, step_json)
    }
    
    calc_count = calc_count + 1
    
    step_json = step_1 = step_2 = step_3 = ''
    val1 =  val2 = val3 = val4 = val5 = 0
    
  }
  
  str_json = gsub("\\\\", "", jsonlite::toJSON(result_json))
  str_prior_parse = sub('^[^\\{]*\\{', '[{', str_json)
  str_after_parse = gsub("\"]", "]", str_prior_parse)
  json_result = gsub("}\\,]", "}]", str_after_parse)
  
  base64_enc_str = base64_enc(json_result)
  return(base64_enc_str)
  
}

#* Get Event based on all Camera from Database
#* @param from -> start time recored to capture
#* @param to -> end time recored to capture
#* @get /event
event <- function(from, to) {
  options(scipen=999)
  data_handler <- dbConnect(MySQL(), user=db_cloud_user, password=db_cloud_password, dbname=db_cloud_name, host=db_cloud_host)
  i_from = as.numeric(from)
  i_to = as.numeric(to)
  res_query <- dbGetQuery(data_handler, sprintf("select cab32, jstr60k from evt where (op16 = 20 AND tick32 > %d AND etick32 < %d ) order by cab32", i_from, i_to))
  dbDisconnect(data_handler)
  
  type_1 = 0
  type_2 = 0
  type_3 = 0
  type_4 = 0
  type_5 = 0
  type_6 = 0
  type_7 = 0
  type_8 = 0
  
  array_length = lengths(res_query['cab32'])
  step_json = ''  
  calc_count = 1
  
  while(calc_count < array_length) {
    val_32 = as.bigz(as.character(res_query['cab32']$cab32[[calc_count]]))
    val_tmp_32 = as.bigz(as.character(res_query['cab32']$cab32[[calc_count + 1]]))
    
    val_jstr = res_query['jstr60k']$jstr60k[[calc_count]]
    
    step_1 = stri_split_fixed(toString(val_jstr), ":", simplify = T)[, 2]
    step_2 = gsub(" ", "", step_1)
    event_type = str_split(step_2, ",")[[1]][1]
    
    if (val_tmp_32 == val_32)
    {
      if (event_type == 1) {
        type_1 = type_1 + 1
      } else if (event_type == 2) {
        type_2 = type_2 + 1
      } else if (event_type == 3) {
        type_3 = type_3 + 1
      } else if (event_type == 4) {
        type_4 = type_4 + 1
      } else if (event_type == 5) {
        type_5 = type_5 + 1
      } else if (event_type == 6) {
        type_6 = type_6 + 1
      } else if (event_type == 7) {
        type_7 = type_7 + 1
      } else if (event_type == 8) {
        type_8 = type_8 + 1
      }
      calc_count = calc_count + 1
    }
    else
    {
      val1 = val_32 %/% as.bigz(2^26)
      val2 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1))) %/% as.bigz(2^20)
      val3 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2))) %/% as.bigz(2^12)
      val4 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2)) - (as.bigz(2^12) %*% as.bigz(val3))) %/% as.bigz(2^6)
      val5 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2)) - (as.bigz(2^12) %*% as.bigz(val3)) - (as.bigz(2^6) %*% as.bigz(val4)))
      
      step_json = sprintf('%s {zone: %d, area: %d, camera: %d,  evt:[', step_json, as.numeric(val1)/2, as.numeric(val2)/2, as.numeric(val4)/2)
      calc_count = calc_count + 1

      if (type_1 > 0) {
        step_json = sprintf('%s{type: 1, count: %d},', step_json, type_1)
      }
      if (type_2 > 0) {
        step_json = sprintf('%s{type: 2, count: %d},', step_json, type_2)
      }
      if (type_3 > 0) {
        step_json = sprintf('%s{type: 3, count: %d},', step_json, type_3)
      }
      if (type_4 > 0) {
        step_json = sprintf('%s{type: 4, count: %d},', step_json, type_4)
      }
      if (type_5 > 0) {
        step_json = sprintf('%s{type: 5, count: %d},', step_json, type_5)
      }
      if (type_6 > 0) {
        step_json = sprintf('%s{type: 6, count: %d},', step_json, type_6)
      }
      if (type_7 > 0) {
        step_json = sprintf('%s{type: 7, count: %d},', step_json, type_7)
      }
      if (type_8 > 0) {
        step_json = sprintf('%s{type: 8, count: %d},', step_json, type_8)
      }
      step_json = sprintf('%s]},', step_json)
      type_1 = type_2 = type_3 = type_4 = type_5 = type_6 = type_7 = type_8 = 0
    }
    
  }
  
  str_json = gsub("\\\\", "", jsonlite::toJSON(step_json))
  str_prior_parse = sub('^[^\\{]*\\{', '[{', str_json)
  str_after_parse = gsub("\"]", "]", str_prior_parse)
  json_result = gsub("}\\,]", "}]", str_after_parse)
  
  print(json_result)
  
  base64_enc_str = base64_enc(json_result)
  return(base64_enc_str)
  
}

#* Get Event based on time, accidents, weather conditions
#* @param from -> start time recored to capture
#* @param to -> end time recored to capture
#* @param type1 -> accdient type 1
#* @param type2 -> accdient type 2
#* @param type3 -> accdient type 3
#* @param type4 -> accdient type 4
#* @param type5 -> accdient type 5
#* @param type6 -> accdient type 6
#* @param type7 -> accdient type 7
#* @param type8 -> accdient type 8
#* @param spring -> weather spring
#* @param summer -> weather summer
#* @param autumn -> weather autumn
#* @param winter -> weather winter
#* @get /filter
filter <- function(from, to, type1, type2, type3, type4, type5, type6, type7, type8, spring, summer, autumn, winter) {
  
  options(scipen=999)
  data_handler <- dbConnect(MySQL(), user=db_cloud_user, password=db_cloud_password, dbname=db_cloud_name, host=db_cloud_host)
  i_from = as.numeric(from)
  i_to = as.numeric(to)
  res_query <- dbGetQuery(data_handler, sprintf("select cab32, jstr60k from evt where (op16 = 20 AND tick32 > %d AND etick32 < %d ) order by cab32", i_from, i_to))
  dbDisconnect(data_handler)
  
  type_1 = 0
  type_2 = 0
  type_3 = 0
  type_4 = 0
  type_5 = 0
  type_6 = 0
  type_7 = 0
  type_8 = 0
  
  array_length = lengths(res_query['cab32'])
  step_json = ''  
  calc_count = 1
  
  while(calc_count < array_length) {
    val_32 = as.bigz(as.character(res_query['cab32']$cab32[[calc_count]]))
    val_tmp_32 = as.bigz(as.character(res_query['cab32']$cab32[[calc_count + 1]]))
    
    val_jstr = res_query['jstr60k']$jstr60k[[calc_count]]
    
    step_1 = stri_split_fixed(toString(val_jstr), ":", simplify = T)[, 2]
    step_2 = gsub(" ", "", step_1)
    event_type = str_split(step_2, ",")[[1]][1]
    
    if (val_tmp_32 == val_32)
    {
      if (event_type == 1) {
        type_1 = type_1 + 1
      } else if (event_type == 2) {
        type_2 = type_2 + 1
      } else if (event_type == 3) {
        type_3 = type_3 + 1
      } else if (event_type == 4) {
        type_4 = type_4 + 1
      } else if (event_type == 5) {
        type_5 = type_5 + 1
      } else if (event_type == 6) {
        type_6 = type_6 + 1
      } else if (event_type == 7) {
        type_7 = type_7 + 1
      } else if (event_type == 8) {
        type_8 = type_8 + 1
      }
      calc_count = calc_count + 1
    }
    else
    {
      val1 = val_32 %/% as.bigz(2^26)
      val2 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1))) %/% as.bigz(2^20)
      val3 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2))) %/% as.bigz(2^12)
      val4 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2)) - (as.bigz(2^12) %*% as.bigz(val3))) %/% as.bigz(2^6)
      val5 = (val_32 - (as.bigz(2^26) %*% as.bigz(val1)) - (as.bigz(2^20) %*% as.bigz(val2)) - (as.bigz(2^12) %*% as.bigz(val3)) - (as.bigz(2^6) %*% as.bigz(val4)))
      
      step_json = sprintf('%s {zone: %d, area: %d, camera: %d,  evt:[', step_json, as.numeric(val1)/2, as.numeric(val2)/2, as.numeric(val4)/2)
      calc_count = calc_count + 1
      
      if (type_1 > 0 && type1 == 'true') {
        step_json = sprintf('%s{type: 1, count: %d},', step_json, type_1)
      }
      if (type_2 > 0 && type2 == 'true') {
        step_json = sprintf('%s{type: 2, count: %d},', step_json, type_2)
      }
      if (type_3 > 0 && type3 == 'true') {
        step_json = sprintf('%s{type: 3, count: %d},', step_json, type_3)
      }
      if (type_4 > 0 && type4 == 'true') {
        step_json = sprintf('%s{type: 4, count: %d},', step_json, type_4)
      }
      if (type_5 > 0 && type5 == 'true') {
        step_json = sprintf('%s{type: 5, count: %d},', step_json, type_5)
      }
      if (type_6 > 0 && type6 == 'true') {
        step_json = sprintf('%s{type: 6, count: %d},', step_json, type_6)
      }
      if (type_7 > 0 && type7 == 'true') {
        step_json = sprintf('%s{type: 7, count: %d},', step_json, type_7)
      }
      if (type_8 > 0 && type8 == 'true') {
        step_json = sprintf('%s{type: 8, count: %d},', step_json, type_8)
      }
      step_json = sprintf('%s]},', step_json)
      type_1 = type_2 = type_3 = type_4 = type_5 = type_6 = type_7 = type_8 = 0
    }
    
  }
  
  str_json = gsub("\\\\", "", jsonlite::toJSON(step_json))
  str_prior_parse = sub('^[^\\{]*\\{', '[{', str_json)
  str_after_parse = gsub("\"]", "]", str_prior_parse)
  json_result = gsub("}\\,]", "}]", str_after_parse)
  
  print(json_result)
  
  base64_enc_str = base64_enc(json_result)
  return(base64_enc_str)
  
}
