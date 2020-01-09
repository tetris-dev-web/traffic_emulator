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
  
  res_query <- dbGetQuery(data_handler, sprintf("select * from dc where (op16 = 12 AND cab32 = %d AND tick32 >= %d AND etick32 <= %d ) order by tick32 asc", i_cab32, i_from, i_to))
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
  
  tick32_tag = list_tick32[[1]]
  time_array_length = lengths(return_json_data['tick32'])

  json_dck_dcv = ''
  json_all_dcpref = ''
  json_result = ''
  
  calc_count = 1
  
  while (calc_count < (time_array_length + 1)) {
    if (tick32_tag == list_tick32[[calc_count]]) {
      dck_dcv_step_json = sprintf('{"dck": {"op16": %d, "cla": %d, "cab64s": "%s", "cab32s": "%s", "id64": %s, "id32": %d}, "dcv": %s},', 12, as.numeric(list_cla16[[calc_count]]), list_cab64s, list_cab32s, as.bigz(list_id64[[calc_count]]), list_id32[[calc_count]], list_dcv[[calc_count]])
      json_dck_dcv = paste(json_dck_dcv, dck_dcv_step_json)
      calc_count = calc_count + 1
    } else {
      dcpref_step_json = sprintf('{"dcpref": {"cab64s": "%s", "op": %d, "ser": %d}, "items":[%s]},', db_node_name, as.numeric(op_val), as.numeric(ser_val), json_dck_dcv)
      json_all_dcpref = paste(json_all_dcpref, dcpref_step_json)
      tick32_tag = list_tick32[[calc_count]]
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

#* Get EVT from Database
#* @param from -> start time recored to capture
#* @param to -> end time recored to capture
#* @param zone -> zone number
#* @param area -> area number
#* @param camera -> camera number
#* @get /evt
evt <- function(from, to, zone, area, camera){
  
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
  
  res_query <- dbGetQuery(data_handler, sprintf("select * from dc where (op16 = 20 AND cab32 = %d AND tick32 >= %d AND etick32 <= %d ) order by tick32 asc", i_cab32, i_from, i_to))
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
  
  tick32_tag = list_tick32[[1]]
  time_array_length = lengths(return_json_data['tick32'])
  
  json_dck_dcv = ''
  json_all_dcpref = ''
  json_result = ''
  
  calc_count = 1
  
  while (calc_count < (time_array_length + 1)) {
    if (tick32_tag == list_tick32[[calc_count]]) {
      dck_dcv_step_json = sprintf('{"dck": {"op16": %d, "cla": %d, "cab64s": "%s", "cab32s": "%s", "id64": %s, "id32": %d}, "dcv": %s},', 12, as.numeric(list_cla16[[calc_count]]), list_cab64s, list_cab32s, as.bigz(list_id64[[calc_count]]), list_id32[[calc_count]], list_dcv[[calc_count]])
      json_dck_dcv = paste(json_dck_dcv, dck_dcv_step_json)
      calc_count = calc_count + 1
    } else {
      dcpref_step_json = sprintf('{"dcpref": {"cab64s": "%s", "op": %d, "ser": %d}, "items":[%s]},', db_node_name, as.numeric(op_val), as.numeric(ser_val), json_dck_dcv)
      json_all_dcpref = paste(json_all_dcpref, dcpref_step_json)
      tick32_tag = list_tick32[[calc_count]]
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
#* @get /emata
emeta <- function(zone, area, camera){
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